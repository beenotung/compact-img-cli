import { KB, parseByteSize } from '@beenotung/tslib/size'
import { DAY, MINUTE, HOUR, SECOND } from '@beenotung/tslib/time'
import { main, Mode } from './main'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../package')

let dir = '.'
let max_size = 300 * KB
let mode: Mode = 'once'
let backup_dir = 'none'
let interval = 1 * DAY

export function showHelp() {
  console.info(
    `
${pkg.name} v${pkg.version}

Usage: compact-img-cli [options]
   Or: compact-img [options]

Options:
  -h | --help         Show this help message
  -d | --dir          Directory to be scanned                       (Default is current working directory)
  -s | --max-size     Compact the images if it excesses this size   (Default 300KB)
  -m | --mode         'once' or 'daemon'                            (Default is 'once')
  -b | --backup-dir   Directory to backup original image            (Default is none)
                      Without backup, the image will be overwritten
  -i | --interval     Interval between each scan in 'daemon' mode   (Default in 1 day)
                      Format: 1d -> 1 day
                              1h -> 1 hour
                              1m -> 1 minute
                              1s -> 1 second
                              1  -> 1 ms
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
    case '--interval':
    case '-i':
      i++
      {
        const input = process.argv[i]
        if (!input) {
          console.error('missing interval duration in arguments')
          process.exit(1)
        }
        interval = parseFloat(input)
        const unit = input[input.length - 1]
        switch (unit) {
          case 'd':
          case 'D':
            interval *= DAY
            break
          case 'h':
          case 'H':
            interval *= HOUR
            break
          case 'm':
          case 'M':
            interval *= MINUTE
            break
          case 's':
          case 'S':
            interval *= SECOND
            break
        }
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
  interval,
}).catch(err => {
  console.error(err)
  process.exit(1)
})
