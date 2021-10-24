# compact-img-cli

compress images recursively in the filesystem

## Usage

**Usage after install** (recommended):

```bash
npm i -g compact-img-cli
compact-img-cli [options]
```

**Usage without install**:

```bash
npx compact-img-cli [options]
```

## Options

| Short Form | Full Form    | Default                   | Description                                               |
| ---------- | ------------ | ------------------------- | --------------------------------------------------------- |
| -d         | --dir        | current working directory | the directory to be scanned recursively                   |
| -s         | --max-size   | 300KB                     | compact the image if excesses this size                   |
| -m         | --mode       | `once`                    | `once` or `daemon`                                        |
| -b         | --backup-dir | none                      | backup the original image , otherwise will be overwritten |

## License

This project is licensed with [BSD-2-Clause](./LICENSE)

This is free, libre, and open-source software. It comes down to four essential freedoms [[ref]](https://seirdy.one/2021/01/27/whatsapp-and-the-domestication-of-users.html#fnref:2):

- The freedom to run the program as you wish, for any purpose
- The freedom to study how the program works, and change it so it does your computing as you wish
- The freedom to redistribute copies so you can help others
- The freedom to distribute copies of your modified versions to others
