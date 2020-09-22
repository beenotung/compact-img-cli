import {scanRecursively} from "@beenotung/tslib/fs";
import sharp from 'sharp'
import * as fs from "fs";
import {filesForEach} from "@beenotung/tslib";

export async function main(options: {
    mode: 'daemon' | 'once'
    backup?: string
    dir: string
    max_size: number
}) {
    if (options.backup && !fs.existsSync(options.backup)) {
        fs.mkdirSync(options.dir, {recursive: true})
    }
    await scanRecursively({
        entryPath: options.dir,
        dereferenceSymbolicLinks: false,
        onFile: async (filename, basename) => {
            let ext = filename.split('.').pop()!
            if (!isImageExt(ext)) return
            console.log('image', filename)
            for (; ;) {
                let size = fs.statSync(filename).size
                if (size <= options.max_size) return
                let image = sharp(filename)
                let metadata = await image.metadata()
                let {width, height} = metadata
                console.log({size, width, height})
                let newWidth = Math.round(width * 0.5)
                let newHeight = Math.round(height * 0.5)
                if (newWidth === width && newHeight === height) return
                console.log('resize', {width, newWidth})
                let tmpfile = filename + '.tmp'
                width = newWidth
                height = newHeight
                // TODO do rotation
                let outfile = await image.resize({height, width}).toFile(tmpfile)
                console.log('out', outfile)
                console.log('rename',tmpfile,filename)
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
