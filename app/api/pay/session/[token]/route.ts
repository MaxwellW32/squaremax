import { getRedirectPage } from "@/lib/payments/powertranz"

//serves the parked PowerTranz hosted-page HTML (card form + 3DS challenge)
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
    const { token } = await params
    const html = getRedirectPage(token)

    if (html === null) {
        return new Response(
            `<!doctype html><html><body><p>This payment session expired.</p><script>setTimeout(()=>{window.location.replace("/sites")},1500)</script></body></html>`,
            { status: 410, headers: { "content-type": "text/html" } },
        )
    }

    return new Response(html, { status: 200, headers: { "content-type": "text/html" } })
}
