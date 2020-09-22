#!/usr/bin/env ts-node
import {main} from "../src/main";

main({
    dir: 'res/sample',
    mode: 'once',
    backup: 'res/backup',
    max_size: 1024 * 1024,
})
