# compact-img-cli

compress images recursively in the filesystem

[![npm Package Version](https://img.shields.io/npm/v/compact-img-cli.svg?maxAge=2592000)](https://www.npmjs.com/package/compact-img-cli)

## Usage

**Usage without install**:

```bash
npx compact-img-cli [options]
```

**Usage after install** (recommended):

```bash
## install
npm i -g compact-img-cli

# usage
compact-img-cli [options]
# or
compact-img [options]
```

## Options

```
-h | --help         Show this help message
-d | --dir          Directory to be scanned   (Default is current working directory)
-s | --max-size     Compact the images if it excesses this size  (Default 300KB)
-m | --mode         'once' or 'daemon'  (Default is 'once')
-b | --backup-dir   Directory to backup original image, otherwise will be overwritten   (Default is none)
-i | --interval     Interval between each scan in 'daemon' mode   (Default in 1 day)
                    Format: 1d -> 1 day
                            1h -> 1 hour
                            1m -> 1 minute
                            1s -> 1 second
                            1  -> 1 ms
```

## License

This project is licensed with [BSD-2-Clause](./LICENSE)

This is free, libre, and open-source software. It comes down to four essential freedoms [[ref]](https://seirdy.one/2021/01/27/whatsapp-and-the-domestication-of-users.html#fnref:2):

- The freedom to run the program as you wish, for any purpose
- The freedom to study how the program works, and change it so it does your computing as you wish
- The freedom to redistribute copies so you can help others
- The freedom to distribute copies of your modified versions to others
