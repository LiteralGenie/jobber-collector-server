import { sqlite } from './deps.ts'
import paths from './paths.ts'

function connect() {
    console.log('connecting to', paths.DB_FILE)
    return new sqlite.DB(paths.DB_FILE)
}

function createTables() {
    const conn = connect()

    conn.execute(`
        CREATE TABLE IF NOT EXISTS indeed_posts (
            id              TEXT        NOT NULL,
            createdAt       TEXT        NOT NULL,
            updatedAt       TEXT        NOT NULL,
            
            company         TEXT        NOT NULL,
            companyId       TEXT,
            textContent     TEXT        NOT NULL,
            title           TEXT        NOT NULL,

            PRIMARY KEY (id)
        )
    `)

    conn.close()
}

export default {
    connect,
    createTables,
}
