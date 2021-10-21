import { KB, parseByteSize } from '@beenotung/tslib/size'
import { main, Mode } from './main'

let dir = '.'
let max_size = 300 * KB
let mode: Mode = 'once'
let backup_dir = ''

for (let i = 0; i < process.argv.length; i++) {
  switch (process.argv[i]) {
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
