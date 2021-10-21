import { scanRecursively } from '@beenotung/tslib/fs'
import sharp from 'sharp'
import * as fs from 'fs'
import { filesForEach } from '@beenotung/tslib'

export type Mode = 'daemon' | 'once'

export async function main(options: {
  mode: 'daemon' | 'once'
  backup_dir: 'none' | string
  dir: string
  max_size: number
}) {
  if (options.backup_dir !== 'none' && !fs.existsSync(options.backup_dir)) {
    fs.mkdirSync(options.backup_dir, { recursive: true })
  }
  await scanRecursively({
    entryPath: options.dir,
    dereferenceSymbolicLinks: false,
    onFile: async (filename, basename) => {
      const ext = filename.split('.').pop()!
      if (!isImageExt(ext)) return
      console.log('image', filename)
      for (;;) {
        const size = fs.statSync(filename).size
        if (size <= options.max_size) return
        const image = sharp(filename)
        const metadata = await image.metadata()
        let { width, height } = metadata
        console.log({ size, width, height })
        const newWidth = Math.round(width * 0.5)
        const newHeight = Math.round(height * 0.5)
        if (newWidth === width && newHeight === height) return
        console.log('resize', { width, newWidth })
        const tmpfile = filename + '.tmp'
        width = newWidth
        height = newHeight
        // TODO do rotation
        const outfile = await image.resize({ height, width }).toFile(tmpfile)
        console.log('out', outfile)
        console.log('rename', tmpfile, filename)
        fs.renameSync(tmpfile, filename)
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
