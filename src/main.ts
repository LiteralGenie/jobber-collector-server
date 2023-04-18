import db from './db.ts'
import { oak } from './deps.ts'
import { IndeedPost } from './models/index.ts'
import paths from './paths.ts'

async function main() {
    await setup()
    await run()
}

async function setup() {
    paths.init()
    db.createTables()
}

async function run() {
    const router = new oak.Router()
        // Upsert indeed post
        .post(
            '/post',
            db.withConn(async (ctx, conn) => {
                const body = await ctx.request.body({ type: 'json' })
                    .value as IndeedPost.Raw
                const [post, isNew] = IndeedPost.upsert(
                    IndeedPost.Model.fromRaw(body),
                    conn,
                )
                ctx.response.body = {
                    data: post,
                    isNew,
                }
            }),
        )

    const app = new oak.Application()
        .use(router.routes())
        .use(router.allowedMethods())

    await app.listen({ port: 8000 })
}

main()
