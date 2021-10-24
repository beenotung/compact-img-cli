import { scanRecursively } from '@beenotung/tslib/fs'
import { format_byte } from '@beenotung/tslib/format'
import sharp from 'sharp'
import {
  writeFileSync,
  renameSync,
  statSync,
  unlinkSync,
  mkdirSync,
  existsSync,
} from 'fs'
import { dirname, join } from 'path'

export type Mode = 'daemon' | 'once'

const tmp_suffix = '.tmp'

function mkdirP(file: string) {
  if (!existsSync(file)) {
    mkdirSync(file, { recursive: true })
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
        unlinkSync(filename)
        return
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const ext = filename.split('.').pop()!
      if (!isImageExt(ext)) return
      console.info('image:', filename)
      let size = statSync(filename).size
      if (size <= max_size) return
      let image = sharp(filename, { failOnError: false })

      // original ratio
      const { width, height } = await image.metadata()
      if (!width || !height) {
        console.info('no size:', filename)
        return
      }
      const aspectRatio = width / height
      for (;;) {
        const { width, height } = await image.metadata()
        if (!width || !height) {
          console.info('no size:', filename)
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
        console.info(msg)
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
        console.info(
          ' '.repeat(msg.length),
          `  resize: ${sizeText} -> ${newSizeText}`,
        )
        if (newSize > max_size) {
          image = sharp(output)
          size = newSize
          continue
        }
        if (backup_dir !== 'none') {
          const backupFile = join(backup_dir, filename)
          mkdirP(dirname(backupFile))
          renameSync(filename, backupFile)
        }
        console.info(`update: ${filename}`)
        writeFileSync(filename, output)
        return
      }
    },
  })
  console.info('done')
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
