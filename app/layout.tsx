import type { Metadata } from "next";
import localFont from "next/font/local";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

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
  title: "Squaremax — your business website + booking, notifications & inventory. $5/month per piece.",
  description: "A beautiful hosted website at squaremaxtech.com/your-business from $5/month, with booking, customer notifications and inventory tracking at $5/month each. Need fully custom? Flat-price builds from $1,000.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geist.variable} ${spaceGrotesk.variable} ${materialSymbolsOutlined.variable} ${materialSymbolsRounded.variable} ${materialSymbolsSharp.variable} antialiased`}
      >
        <SessionProvider>
          <Toaster position="top-center" reverseOrder={false} />

          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
