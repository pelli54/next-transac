import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export { default } from 'next-auth/middleware'

export const requireAuth = ['/admin', '/api/admin']

export async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname
    if (requireAuth.some((path) => pathname.startsWith(path))) {
        const session = await getToken({ req })
        if (!session) {
            return NextResponse.redirect(new URL('/signin', req.url))
        }
        return NextResponse.next()
    }
    return NextResponse.next()
}