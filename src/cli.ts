import { KB, parseByteSize } from '@beenotung/tslib/size'
import { main, Mode } from './main'
const pkg = require('../package')

let dir = '.'
let max_size = 300 * KB
let mode: Mode = 'once'
let backup_dir = 'none'

export function showHelp() {
  console.info(
    `
${pkg.name} v${pkg.version}

Usage: compact-img-cli [options]
   Or: compact-img [options]

Options:
  -h | --help         Show this help message
  -d | --dir          Directory to be scanned   (Default is current working directory)
  -s | --max-size     Compact the images if it excesses this size  (Default 300KB)
  -m | --mode         once or daemon  (Default is once)
  -b | --backup-dir   Directory to backup original image, otherwise will be overwritten   (Default is none)
`.trim(),
  )
}

for (let i = 2; i < process.argv.length; i++) {
  switch (process.argv[i]) {
    case '--help':
    case '-h':
      showHelp()
      process.exit(0)
      break
    case '--dir':
    case '-d':
      i++
      dir = process.argv[i]
      if (!dir) {
        console.error('missing directory in arguments')
        process.exit(1)
      }
      break
    case '--max-size':
    case '-s':
      i++
      max_size = parseByteSize(process.argv[i])
      if (!max_size) {
        console.error('missing max_size in arguments')
        process.exit(1)
      }
      break
    case '--mode':
    case '-m':
      i++
      mode = process.argv[i].toLowerCase() as Mode
      if (mode === 'once' || mode === 'daemon') {
        break
      }
      console.error('unknown mode in arguments')
      process.exit(1)
      break
    case '--backup-dir':
    case '-b':
      i++
      backup_dir = process.argv[i]
      if (!backup_dir) {
        console.error('missing backup directory in arguments')
        process.exit(1)
      }
      break
    default:
      console.error('unknown argument:', process.argv[i])
      process.exit(1)
  }
}

main({
  mode,
  backup_dir,
  dir,
  max_size,
}).catch(err => {
  console.error(err)
  process.exit(1)
})
