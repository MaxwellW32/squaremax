import { describe, expect, it } from "vitest"
import { hostToLookupDomain, isPlatformHost, normalizeDomain } from "@/lib/sites/domains"

describe("normalizeDomain", () => {
    it("accepts a plain apex and strips protocol, www, path and port", () => {
        expect(normalizeDomain("joesbarber.com")).toEqual({ ok: true, domain: "joesbarber.com" })
        expect(normalizeDomain("  HTTPS://www.JoesBarber.com/about?x=1 ")).toEqual({ ok: true, domain: "joesbarber.com" })
        expect(normalizeDomain("shop.joesbarber.com:8443")).toEqual({ ok: true, domain: "shop.joesbarber.com" })
    })

    it("rejects junk and the platform's own hosts", () => {
        expect(normalizeDomain("").ok).toBe(false)
        expect(normalizeDomain("not a domain").ok).toBe(false)
        expect(normalizeDomain("localhost").ok).toBe(false)
        expect(normalizeDomain("squaremaxtech.com").ok).toBe(false)
        expect(normalizeDomain("joes.squaremaxtech.com").ok).toBe(false)
        expect(normalizeDomain("-bad.com").ok).toBe(false)
    })
})

describe("hostToLookupDomain", () => {
    it("maps www and ports onto the stored apex", () => {
        expect(hostToLookupDomain("WWW.JoesBarber.com:443")).toBe("joesbarber.com")
        expect(hostToLookupDomain("joesbarber.com.")).toBe("joesbarber.com")
    })

    it("knows the platform hosts", () => {
        expect(isPlatformHost("squaremaxtech.com")).toBe(true)
        expect(isPlatformHost("localhost:3000")).toBe(true)
        expect(isPlatformHost("joesbarber.com")).toBe(false)
    })
})
