import { scanRecursively } from '@beenotung/tslib/fs'
import { format_byte } from '@beenotung/tslib/format'
import sharp from 'sharp'
import * as fs from 'fs'
import * as path from 'path'

export type Mode = 'daemon' | 'once'

const tmp_suffix = '.tmp'

function mkdirP(file: string) {
  if (!fs.existsSync(file)) {
    fs.mkdirSync(file, { recursive: true })
  }
}

export async function main(options: {
  mode: 'daemon' | 'once'
  backup_dir: 'none' | string
  dir: string
  max_size: number
}) {
  const { backup_dir, max_size } = options
  if (backup_dir !== 'none') {
    mkdirP(backup_dir)
  }
  await scanRecursively({
    entryPath: options.dir,
    dereferenceSymbolicLinks: false,
    onFile: async (filename, basename) => {
      if (basename.endsWith(tmp_suffix)) {
        fs.unlinkSync(filename)
        return
      }
      const ext = filename.split('.').pop()!
      if (!isImageExt(ext)) return
      console.log('image:', filename)
      let size = fs.statSync(filename).size
      if (size <= max_size) return
      let image = sharp(filename, { failOnError: false })

      // original ratio
      const { width, height } = await image.metadata()
      if (!width || !height) {
        console.log('no size:', filename)
        return
      }
      const aspectRatio = width / height
      for (;;) {
        const { width, height } = await image.metadata()
        if (!width || !height) {
          console.log('no size:', filename)
          return
        }
        const area = width * height
        const sizePerArea = size / area
        let newWidth = width
        let newHeight = height
        for (; newWidth > 1 && newHeight > 1; ) {
          const newArea = newWidth * newHeight
          const newSize = newArea * sizePerArea
          if (newSize <= max_size) break
          const newAspectRatio = newWidth / newHeight
          if (newAspectRatio > aspectRatio) {
            newWidth--
          } else if (newAspectRatio < aspectRatio) {
            newHeight--
          } else {
            newWidth--
            newHeight--
          }
        }
        const msg = `rescale: ${width}x${height} -> ${newWidth}x${newHeight}`
        console.log(msg)
        // TODO do rotation
        const output = await image
          .jpeg({ progressive: true, quality: 80, force: false })
          .webp({ quality: 80, force: false })
          .png({ progressive: true, compressionLevel: 8, force: false })
          .resize({ height: newHeight, width: newWidth, fit: 'inside' })
          .toBuffer()
        const newSize = output.length
        const newSizeText = format_byte(newSize)
        const sizeText = format_byte(size)
        console.log(
          ' '.repeat(msg.length),
          `  resize: ${sizeText} -> ${newSizeText}`,
        )
        if (newSize > max_size) {
          image = sharp(output)
          size = newSize
          continue
        }
        if (backup_dir !== 'none') {
          const backupFile = path.join(backup_dir, filename)
          mkdirP(path.dirname(backupFile))
          fs.renameSync(filename, backupFile)
        }
        console.log(`update: ${filename}`)
        fs.writeFileSync(filename, output)
        return
      }
    },
  })
  console.log('done')
}

function isImageExt(ext: string) {
  switch (ext.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'bmp':
      return true
    default:
      return false
  }
}
