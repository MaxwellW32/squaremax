import React from "react"
import { Playfair_Display, Inter, Lora, Nunito } from "next/font/google"

//curated tenant font set (Layer 1 themes reference these by key).
//loaded only on tenant pages — marketing chrome never pays for them.
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-playfair" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" })
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" })

export default function TenantLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className={`${playfair.variable} ${inter.variable} ${lora.variable} ${nunito.variable}`}>
            {children}
        </div>
    )
}
