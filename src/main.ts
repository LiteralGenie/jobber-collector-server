import db from './db.ts'
import { oak, oak_logger } from './deps.ts'
import log from './log.ts'
import { IndeedPost } from './models/index.ts'
import paths from './paths.ts'

const LOG = log.get({ name: 'main' })

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
                LOG.info(
                    `${
                        isNew
                            ? 'Created'
                            : 'Updated'
                    } | ${body.title} (${body.id})`,
                )
                LOG.debug(body, ctx.response.body)
            }),
        )

    const app = new oak.Application()
        .use(oak_logger.responseTime)
        .use(router.routes())
        .use(router.allowedMethods())

    await app.listen({ port: 8000 })
}

main()
