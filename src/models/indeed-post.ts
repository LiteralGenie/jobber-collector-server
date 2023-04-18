import { sqlite } from '../deps.ts'

export function initTable(conn: sqlite.DB) {
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
}

export interface Raw {
    id: string

    company: string
    companyId?: string
    textContent: string
    title: string
}

type ModelProps = {
    id: string
    createdAt: string
    updatedAt: string
    company: string
    companyId: string | null
    textContent: string
    title: string
}

export class Model implements ModelProps {
    id!: string
    createdAt!: string
    updatedAt!: string
    company!: string
    companyId!: string | null
    textContent!: string
    title!: string

    constructor(data: ModelProps) {
        Object.assign(this, data)
    }

    static fromRaw(raw: Raw): Model {
        const props: ModelProps = {
            ...raw,
            companyId: raw.companyId || null,
            createdAt: '',
            updatedAt: '',
        }
        return new Model(props)
    }
}

export function upsert(data: Model, conn: sqlite.DB): [Model, boolean] {
    let update = { ...data, updatedAt: new Date().toISOString() }

    const old = conn.queryEntries<ModelProps>(
        `SELECT * FROM indeed_posts WHERE id = ?`,
        [data.id],
    )[0]
    if (old) {
        update = { ...update, createdAt: old.createdAt }
    }

    conn.query(
        `
            INSERT OR REPLACE INTO indeed_posts
            (id, createdAt, updatedAt, company, companyId, textContent, title) VALUES
            (:id, :createdAt, :updatedAt, :company, :companyId, :textContent, :title)
        `,
        update,
    )

    return [new Model(update), !old]
}
