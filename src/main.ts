import db from './db.ts'
import { oak, sqlite } from './deps.ts'
import paths from './paths.ts'

async function main() {
    const app = new oak.Application()

    app.use((ctx) => {
        const conn = db.connect()

        conn.query(
            `
            INSERT INTO indeed_posts
            (id, createdAt, updatedAt, company, companyId, textContent, title) VALUES
            (?, ?, ?, ?, ?, ?, ?)
        `,
            ['ab', 'ac', 'ad', 'ae', 'af', 'ag', 'ah'],
        )

        ctx.response.body = 'Hello World!'

        conn.close()
    })

    await app.listen({ port: 8000 })
}

paths.init()
db.createTables()
main()
