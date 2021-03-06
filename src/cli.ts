import {main} from "./main";

let env = process.env
for (let key of Object.keys(env)) {
    env[key.toLowerCase()] = env[key]
}
main({
    mode: env.mode as any || 'once',
    backup: env.backup,
    dir: env.dir,
    max_size: +env.max_size || 1024 * 1024,
})
    .catch(err => {
        console.error(err)
        process.exit(1)
    })
