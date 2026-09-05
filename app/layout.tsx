import type { Metadata } from "next";
import localFont from "next/font/local";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

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
  title: "Squaremax — your business online tonight. Websites with booking & orders from US$10/month.",
  description: "Professional websites for Jamaican small businesses at squaremaxtech.com/your-business, with online booking, orders and customer messaging built in. From US$10/month, edit it yourself from your phone. Custom builds from US$1,000.",
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
      <body className={`${geist.variable} ${spaceGrotesk.variable} antialiased`}>
        <SessionProvider>
          <Toaster position="top-center" reverseOrder={false} />

          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
