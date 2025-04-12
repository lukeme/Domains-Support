import type { Env } from '../../types'

interface AlertConfig {
    tg_token: string
    tg_userid: string
    days: number
}

interface Domain {
    domain: string
    expiry_date: string
    tgsend: number
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        // 验证 API Token
        const url = new URL(context.request.url)
        const tokenParam = url.searchParams.get('token')
        const authHeader = context.request.headers.get('Authorization')
        const headerToken = authHeader?.replace('Bearer ', '')

        // 同时支持查询参数和 Bearer Token
        const token = tokenParam || headerToken

        if (!token || token !== context.env.API_TOKEN) {
            return Response.json({
                status: 401,
                message: '未授权访问',
                data: null
            }, { status: 401 })
        }

        console.log('开始执行域名检查...')
        const { results: configResults } = await context.env.DB.prepare(
            'SELECT * FROM alertcfg LIMIT 1'
        ).all<AlertConfig>()

        if (!configResults.length) {
            console.log('未找到告警配置')
            return Response.json({
                status: 404,
                message: '未找到告警配置',
                data: null
            }, { status: 404 })
        }

        const config = configResults[0]
        console.log('获取到告警配置:', {
            days: config.days,
            has_token: !!config.tg_token,
            has_userid: !!config.tg_userid
        })

        // 获取所有域名
        const { results: domains } = await context.env.DB.prepare(
            'SELECT domain, expiry_date, tgsend FROM domains WHERE tgsend = 1'
        ).all<Domain>()

        console.log(`找到 ${domains.length} 个启用通知的域名`)
        const notifiedDomains = []

        for (const domain of domains) {
            const remainingDays = calculateRemainingDays(domain.expiry_date)
            console.log(`检查域名 ${domain.domain}: 过期时间 ${domain.expiry_date}, 剩余天数 ${remainingDays}`)

            if (remainingDays <= config.days) {
                console.log(`域名 ${domain.domain} 需要发送通知：剩余天数(${remainingDays}) <= 阈值(${config.days})`)
                const message = `*🔔 Domains-Support通知*\n\n` +
                    `🌐 域名：\`${domain.domain}\`\n` +
                    `📅 过期时间：\`${domain.expiry_date}\`\n` +
                    `⏳ 剩余天数：\`${remainingDays}天\`\n\n` +
                    `⚠️ 剩余天数告警，请尽快进行续约！`

                try {
                    console.log('准备发送 Telegram 消息...')
                    await sendTelegramMessage(config.tg_token, config.tg_userid, message)
                    console.log(`成功发送 Telegram 通知：${domain.domain}`)
                    notifiedDomains.push({
                        domain: domain.domain,
                        remainingDays,
                        expiry_date: domain.expiry_date
                    })
                } catch (error) {
                    console.error(`发送 Telegram 消息失败:`, error)
                    throw error
                }
            }
        }

        return Response.json({
            status: 200,
            message: '检查完成',
            data: {
                total_domains: domains.length,
                notified_domains: notifiedDomains
            }
        })
    } catch (error) {
        console.error('检查执行失败:', error)
        return Response.json({
            status: 500,
            message: '检查执行失败: ' + (error as Error).message,
            data: null
        }, { status: 500 })
    }
}

// 添加对 GET 方法的支持
export const onRequestGet: PagesFunction<Env> = onRequestPost

function calculateRemainingDays(expiryDate: string): number {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiry = new Date(expiryDate)
    expiry.setHours(0, 0, 0, 0)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
}

async function sendTelegramMessage(token: string, chatId: string, message: string): Promise<void> {
    if (!token || !chatId) {
        throw new Error('Telegram token 或 chat ID 未配置')
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`
    console.log('发送 Telegram 请求:', { url, chatId, messageLength: message.length })

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown',
        }),
    })

    const responseData = await response.json()

    if (!response.ok) {
        console.error('Telegram API 响应错误:', responseData)
        throw new Error(`Failed to send Telegram message: ${response.statusText}, Details: ${JSON.stringify(responseData)}`)
    }

    console.log('Telegram API 响应:', responseData)
} 