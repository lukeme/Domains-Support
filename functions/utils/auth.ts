import { Env } from '../types'

export const checkAuth = async (context: EventContext<Env, any, any>) => {
    const authHeader = context.request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({
            status: 401,
            message: '未授权访问',
            data: null
        }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        })
    }
    return null
}

export const checkApiToken = async (context: EventContext<Env, any, any>) => {
    const url = new URL(context.request.url)
    const tokenParam = url.searchParams.get('token')
    const authHeader = context.request.headers.get('Authorization')
    const headerToken = authHeader?.replace('Bearer ', '')
    const token = tokenParam || headerToken

    if (!token || token !== context.env.API_TOKEN) {
        return new Response(JSON.stringify({
            status: 401,
            message: '无效的访问令牌',
            data: null
        }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        })
    }
    return null
} 