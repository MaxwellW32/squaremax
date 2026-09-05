import type { MetadataRoute } from "next"

//search engines: index the marketing site and live tenant pages; keep the
//dashboard, sign-in, payment and API routes out of results
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/dashboard", "/admin", "/api/", "/signin", "/sites/start", "/sites/live/", "/domains/"],
            },
        ],
        sitemap: "https://squaremaxtech.com/sitemap.xml",
    }
}
