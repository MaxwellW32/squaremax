import { NextRequest, NextResponse } from "next/server"

//custom-domain add-on: Caddy (on-demand TLS) proxies tenant domains to this
//app; any host other than the canonical site is rewritten to the internal
//domain-lookup route, which resolves the tenant from the DB (cached).
const CANONICAL_HOSTS = new Set([
    "squaremaxtech.com",
    "www.squaremaxtech.com",
    "localhost:3000",
    "localhost",
    "127.0.0.1:3000",
    "127.0.0.1",
])

export default function proxy(request: NextRequest) {
    const host = request.headers.get("host")?.toLowerCase() ?? ""

    if (host === "" || CANONICAL_HOSTS.has(host)) return NextResponse.next()

    //only rewrite page requests; assets/api keep working as-is
    const { pathname } = request.nextUrl
    if (pathname.startsWith("/_next") || pathname.startsWith("/api")) return NextResponse.next()

    const url = request.nextUrl.clone()
    //tenant sites are multi-page now: the root and single-segment paths
    //(/about, /account) rewrite to the domain route; deeper paths 404
    //(four segments never match /domains/[domain]/[pageSlug])
    const segments = pathname.split("/").filter(segment => segment !== "")
    url.pathname = segments.length === 0 ? `/domains/${host}`
        : segments.length === 1 ? `/domains/${host}/${segments[0]}`
            : `/domains/${host}/nf/nf`
    return NextResponse.rewrite(url)
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
