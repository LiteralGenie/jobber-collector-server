import { pathlib } from './deps.ts'

const SRC_DIR = pathlib.dirname(pathlib.fromFileUrl(import.meta.url))

const DATA_DIR = SRC_DIR + '/data'
const LOG_DIR = DATA_DIR + '/logs'

const DB_FILE = DATA_DIR + '/db.sqlite'

function init() {
    const targets = [DATA_DIR, LOG_DIR]

    for (const fp of targets) {
        Deno.mkdir(fp, { recursive: true })
    }
}

export default { init, SRC_DIR, DATA_DIR, LOG_DIR, DB_FILE }
