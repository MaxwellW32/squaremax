import type { Metadata } from "next";
import localFont from "next/font/local";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { auth } from "@/auth/auth";
import SiteHeader from "@/components/marketing/SiteHeader";
import SiteFooter from "@/components/marketing/SiteFooter";

const materialSymbolsOutlined = localFont({
  src: "./fonts/MaterialSymbolsOutlined-VariableFont_FILL,GRAD,opsz,wght.ttf",
  variable: "--materialSymbolsOutlined",
});
const materialSymbolsRounded = localFont({
  src: "./fonts/MaterialSymbolsRounded-VariableFont_FILL,GRAD,opsz,wght.ttf",
  variable: "--materialSymbolsRounded",
});
const materialSymbolsSharp = localFont({
  src: "./fonts/MaterialSymbolsSharp-VariableFont_FILL,GRAD,opsz,wght.ttf",
  variable: "--materialSymbolsSharp",
});

const geist = localFont({
  src: "./fonts/Geist.ttf",
  variable: "--geist",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
});

const metadataInfo = {
  title: "Squaremax — Custom websites from $1,000 flat. Business pages from $10/month.",
  description: "Two ways to get online: fixed-scope custom builds at flat tier prices ($1,000 / $3,500 / $6,500), or a hosted business page at squaremaxtech.com/your-business from $10/month. Fixed price. Fixed scope. Days, not months.",
}

export const metadata: Metadata = {
  title: metadataInfo.title,
  description: metadataInfo.description,
  metadataBase: new URL('https://squaremaxtech.com'),
  openGraph: {
    title: metadataInfo.title,
    description: metadataInfo.description,
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth()

  return (
    <html lang="en">
      <body
        className={`${geist.variable} ${spaceGrotesk.variable} ${materialSymbolsOutlined.variable} ${materialSymbolsRounded.variable} ${materialSymbolsSharp.variable} antialiased`}
      >
        <SessionProvider>
          <Toaster position="top-center" reverseOrder={false} />

          <SiteHeader session={session} />

          {children}

          <SiteFooter />
        </SessionProvider>
      </body>
    </html>
  );
}
