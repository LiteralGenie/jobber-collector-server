import { Context } from 'https://deno.land/x/oak@v12.2.0/mod.ts'
import { oak, sqlite } from './deps.ts'
import paths from './paths.ts'
import { IndeedPost } from './models/index.ts'

function connect() {
    return new sqlite.DB(paths.DB_FILE)
}

function createTables() {
    const conn = connect()
    IndeedPost.initTable(conn)
    conn.close()
}

type HandlerFn = (ctx: oak.Context, conn: sqlite.DB) => Promise<unknown>
type WrappedHandlerFn = (ctx: oak.Context) => Promise<unknown>
function withConn(fn: HandlerFn): WrappedHandlerFn {
    async function routeHandler(ctx: oak.Context) {
        const conn = connect()

        try {
            await fn(ctx, conn)
            return
        } finally {
            conn.close()
        }
    }

    return routeHandler
}

export default {
    connect,
    createTables,
    withConn,
}
