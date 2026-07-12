import { Playfair_Display, Inter, Lora, Nunito } from "next/font/google"

//curated tenant font set (Layer 1 themes reference these by key).
//Lives on TenantSite's root element so EVERY consumer — public /[slug] page,
//custom-domain page, wizard preview, dashboard preview — renders identical
//typography. (geist + space grotesk come from the root layout.)
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-playfair" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" })
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" })

export const tenantFontsClassName = `${playfair.variable} ${inter.variable} ${lora.variable} ${nunito.variable}`
