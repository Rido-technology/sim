import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { checkSessionOrInternalAuth } from '@/lib/auth/hybrid'

const logger = createLogger('InstagramCreatePostAPI')

const GRAPH_VERSION = 'v22.0'
const GRAPH_BASE = 'https://graph.facebook.com'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const auth = await checkSessionOrInternalAuth(request)
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { accessToken, imageUrl, caption, altText } = body

    if (!accessToken) {
      return NextResponse.json({ error: 'Page access token is required' }, { status: 400 })
    }

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'imageUrl is required and must be a public URL' }, { status: 400 })
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }

    const meRes = await fetch(
      `${GRAPH_BASE}/${GRAPH_VERSION}/me?fields=instagram_business_account{id}`,
      { headers }
    )
    const meData = await meRes.json()

    if (!meRes.ok) {
      const msg = meData?.error?.message ?? `Failed to get Instagram account (${meRes.status})`
      logger.warn('Instagram create post: get account failed', { status: meRes.status, message: msg })
      return NextResponse.json({ error: msg }, { status: meRes.status })
    }

    const igUserId = meData?.instagram_business_account?.id
    if (!igUserId) {
      return NextResponse.json(
        { error: 'No Instagram Business/Creator account linked to this Page. Link one in Meta Business Suite.' },
        { status: 400 }
      )
    }

    const containerBody: Record<string, string> = { image_url: imageUrl }
    if (caption) containerBody.caption = caption
    if (altText) containerBody.alt_text = altText

    const createRes = await fetch(
      `${GRAPH_BASE}/${GRAPH_VERSION}/${igUserId}/media`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(containerBody),
      }
    )
    const createData = await createRes.json()

    if (!createRes.ok) {
      const msg = createData?.error?.message ?? `Failed to create media container (${createRes.status})`
      logger.warn('Instagram create post: create container failed', { status: createRes.status, message: msg })
      return NextResponse.json({ error: msg }, { status: createRes.status })
    }

    const containerId = createData?.id
    if (!containerId) {
      return NextResponse.json(
        { error: 'Instagram API did not return a container ID' },
        { status: 502 }
      )
    }

    const publishRes = await fetch(
      `${GRAPH_BASE}/${GRAPH_VERSION}/${igUserId}/media_publish`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ creation_id: containerId }),
      }
    )
    const publishData = await publishRes.json()

    if (!publishRes.ok) {
      const msg = publishData?.error?.message ?? `Failed to publish media (${publishRes.status})`
      logger.warn('Instagram create post: publish failed', { status: publishRes.status, message: msg })
      return NextResponse.json({ error: msg }, { status: publishRes.status })
    }

    const mediaId = publishData?.id
    if (!mediaId) {
      return NextResponse.json(
        { error: 'Instagram API did not return a media ID after publish' },
        { status: 502 }
      )
    }

    let permalink: string | undefined
    const permRes = await fetch(
      `${GRAPH_BASE}/${GRAPH_VERSION}/${mediaId}?fields=permalink`,
      { headers }
    )
    if (permRes.ok) {
      const permData = await permRes.json()
      permalink = permData?.permalink
    }

    return NextResponse.json({
      success: true,
      mediaId,
      permalink: permalink ?? undefined,
    })
  } catch (error) {
    logger.error('Instagram create post error', error)
    return NextResponse.json(
      { error: (error as Error).message ?? 'Internal server error' },
      { status: 500 }
    )
  }
}
