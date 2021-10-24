#!/usr/bin/env ts-node
import { main } from '../src/main'
import { KB } from '@beenotung/tslib/size'

main({
  dir: 'res/sample',
  mode: 'once',
  backup_dir: 'res/backup',
  max_size: 800 * KB,
})
