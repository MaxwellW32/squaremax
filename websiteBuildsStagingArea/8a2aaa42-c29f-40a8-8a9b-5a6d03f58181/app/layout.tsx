import { Tangerine, Roboto, Open_Sans, Poppins, Fira_Sans } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import Firstnav_76a62d0d_2f49_4a3b_88e5_ba248caa79a4 from "@/components/76a62d0d-2f49-4a3b-88e5-ba248caa79a4/page";

const tangerine = Tangerine({
variable: "--font-tangerine",
subsets: ["latin"],
weight: ["400"],
});

const roboto = Roboto({
variable: "--font-roboto",
subsets: ["latin"],

});

const openSans = Open_Sans({
variable: "--font-openSans",
subsets: ["latin"],

});

const poppins = Poppins({
variable: "--font-poppins",
subsets: ["latin"],
weight: ["300", "400", "500"],
});

const firaSans = Fira_Sans({
variable: "--font-firaSans",
subsets: ["latin"],
weight: ["300", "400", "500"],
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
        className={`${tangerine.variable} ${roboto.variable} ${openSans.variable} ${poppins.variable} ${firaSans.variable} antialiased`}
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
