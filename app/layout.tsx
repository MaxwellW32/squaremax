import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Nav from "@/components/nav/Nav";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { servicesData } from "@/lib/servicesData";
import Footer from "@/components/footer/Footer";
import { auth } from "@/auth/auth";

//to do
//make custom forms for each edit data category type
//templates can import fonts
//
//fix colours
//incorperate family on template
//fix layout loading state
//
//
//

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

const rubik = localFont({
  src: "./fonts/Rubik.ttf",
  variable: "--rubik",
});

const geist = localFont({
  src: "./fonts/Geist.ttf",
  variable: "--geist",
});

const metadataInfo = {
  title: "Squaremax - Expert Web Development & Mobile App Solutions",
  description: "SquareMax is a leading web development agency specializing in high-performance Next JS websites and seamless React Native mobile app solutions. Our expert team delivers tailored digital experiences, from custom e-commerce platforms to robust software solutions. Contact us to elevate your online presence."
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
        className={`${rubik.variable} ${geist.variable} ${materialSymbolsOutlined.variable} ${materialSymbolsRounded.variable} ${materialSymbolsSharp.variable} antialiased`}
      >
        <SessionProvider>
          <Toaster position="top-center" reverseOrder={false} />
          <Nav
            menuInfoArr={[
              {
                title: "Services",
                link: "/services",
                subMenu: servicesData.map(eachService => {
                  return {
                    title: eachService.name,
                    link: `/services/${eachService.slug}`
                  }
                })
              }, {
                title: "Testimonials",
                link: "/testimonials",
              },
              {
                title: "Blog",
                link: "/blog",
              },
              {
                title: "Projects",
                link: "/projects",
              },
              {
                title: "FAQ",
                link: "/FAQ",
              }
            ]}

            session={session}
          />

          {children}

          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
