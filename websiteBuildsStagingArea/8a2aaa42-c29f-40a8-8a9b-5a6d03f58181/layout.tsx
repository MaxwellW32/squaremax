import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Firstnav_76a62d0d_2f49_4a3b_88e5_ba248caa79a4 from "@/components/76a62d0d-2f49-4a3b-88e5-ba248caa79a4/page";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "new website",
  description: "new website description",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Firstnav_76a62d0d_2f49_4a3b_88e5_ba248caa79a4   
data={{
  "category": "navbars",
  "mainElProps": {},
  "styleId": "____23661674-a82f-4824-9b6a-4f302d276fb8",
  "menu": [
    {
      "label": "nav 1",
      "link": "/",
      "subMenu": [
        {
          "label": "sub menu item 1",
          "link": "/"
        }
      ]
    },
    {
      "label": "menu item 2",
      "link": "/"
    }
  ]
}}
/>

        {children}

        <Firstnav_76a62d0d_2f49_4a3b_88e5_ba248caa79a4   
data={{
  "category": "navbars",
  "mainElProps": {},
  "styleId": "____6f31b110-8f42-4cda-ba36-8e0def003e0b",
  "menu": [
    {
      "label": "menu item 1",
      "link": "/",
      "subMenu": [
        {
          "label": "sub menu item 1",
          "link": "/"
        }
      ]
    },
    {
      "label": "menu item 2",
      "link": "/"
    }
  ]
}}
/>
      </body>
    </html>
  );
}
