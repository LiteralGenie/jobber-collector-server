import { sqlite } from '../deps.ts'

export function initTable(conn: sqlite.DB) {
    conn.execute(`
        CREATE TABLE IF NOT EXISTS indeed_posts (
            id              TEXT        NOT NULL,
            createdAt       TEXT        NOT NULL,
            updatedAt       TEXT        NOT NULL,
            
            company         TEXT        NOT NULL,
            companyId       TEXT,
            html            TEXT        NOT NULL,
            textContent     TEXT        NOT NULL,
            title           TEXT        NOT NULL,

            PRIMARY KEY (id)
        ) STRICT;
    `)
}

export interface Raw {
    id: string

    company: string
    companyId?: string
    html: string
    textContent: string
    title: string
}

type ModelProps = {
    id: string
    createdAt: string
    updatedAt: string

    company: string
    companyId: string | null
    html: string
    textContent: string
    title: string
}

export class Model implements ModelProps {
    id!: string
    createdAt!: string
    updatedAt!: string

    company!: string
    companyId!: string | null
    html!: string
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
    const now = new Date()
    let update = {
        ...data,
        updatedAt: now.toISOString(),
        createdAt: now.toISOString(),
    }

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
            (id, createdAt, updatedAt, company, companyId, html, textContent, title) VALUES
            (:id, :createdAt, :updatedAt, :company, :companyId, :html, :textContent, :title)
        `,
        update,
    )

    return [new Model(update), !old]
}
