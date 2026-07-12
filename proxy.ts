import { NextRequest, NextResponse } from "next/server"

//custom-domain add-on: Caddy (on-demand TLS) proxies tenant domains to this
//app; any host other than the canonical site is rewritten to the internal
//domain-lookup route, which resolves the tenant from the DB (cached).
const CANONICAL_HOSTS = new Set([
    "squaremaxtech.com",
    "www.squaremaxtech.com",
    "localhost:3000",
    "localhost",
])

export default function proxy(request: NextRequest) {
    const host = request.headers.get("host")?.toLowerCase() ?? ""

    if (host === "" || CANONICAL_HOSTS.has(host)) return NextResponse.next()

    //only rewrite page requests; assets/api keep working as-is
    const { pathname } = request.nextUrl
    if (pathname.startsWith("/_next") || pathname.startsWith("/api")) return NextResponse.next()

    const url = request.nextUrl.clone()
    url.pathname = `/domains/${host}`
    return NextResponse.rewrite(url)
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
