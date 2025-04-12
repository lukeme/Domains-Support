/// <reference types="@cloudflare/workers-types" />

export interface Env {
    DB: D1Database
    USER: string
    PASS: string
    API_TOKEN: string
    ASSETS: {
        fetch: typeof fetch
    }
}

export interface Domain {
    id?: number
    domain: string
    registrar: string
    registrar_link: string
    registrar_date: string
    expiry_date: string
    service_type: string
    status: string
    tgsend: number
    memo: string
    created_at?: string
} 