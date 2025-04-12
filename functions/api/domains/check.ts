import { Env } from '../../types'

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const { domain } = await context.request.json() as { domain: string }

        try {
            const controller = new AbortController()
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    controller.abort()
                    reject(new Error('Timeout'))
                }, 5000)
            })

            const fetchPromise = fetch(`https://${domain}`, {
                method: 'GET',
                redirect: 'follow',
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
                }
            })

            const response = await Promise.race([fetchPromise, timeoutPromise])
            const status = response instanceof Response && response.status >= 200 && response.status < 400 ? '在线' : '离线'

            return Response.json({
                status: 200,
                message: '检查完成',
                data: { status }
            })
        } catch (error) {
            console.error(`检查域名 ${domain} 失败:`, error)
            return Response.json({
                status: 200,
                message: '检查完成',
                data: { status: '离线' }
            })
        }
    } catch (error) {
        console.error('域名检查失败:', error)
        return Response.json({
            status: 500,
            message: error instanceof Error ? error.message : '检查失败',
            data: null
        }, { status: 500 })
    }
} 