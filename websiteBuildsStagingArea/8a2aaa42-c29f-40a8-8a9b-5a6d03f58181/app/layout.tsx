import { Barriecito } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import Firstnav_76a62d0d_2f49_4a3b_88e5_ba248caa79a4 from "@/components/76a62d0d-2f49-4a3b-88e5-ba248caa79a4/page";

const barriecito = Barriecito({
variable: "--font-barriecito",
subsets: ["latin"],
weight: ["400"],
});

export const metadata: Metadata = {
  title: "first website",
  description: "the best website ever",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${barriecito.variable} antialiased`}
      >
        <Firstnav_76a62d0d_2f49_4a3b_88e5_ba248caa79a4 
data={{
  "category": "navbars",
  "mainElProps": {},
  "styleId": "____36876f1a-4b60-492b-a41a-b99840b738ed",
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

        {children}

        <Firstnav_76a62d0d_2f49_4a3b_88e5_ba248caa79a4 
data={{
  "category": "navbars",
  "mainElProps": {},
  "styleId": "____717840fa-6d13-4d0f-978a-b055a22100ea",
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
