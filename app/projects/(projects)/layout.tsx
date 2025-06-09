import ViewProjects from "@/components/viewProjects/ViewProjects";
import { Julius_Sans_One, Josefin_Sans, Lato, VT323, Rubik } from "next/font/google";
import localFont from 'next/font/local'

import "./layoutGlobalStyle.css"

const JuliusSansOne = Julius_Sans_One({ subsets: ["latin"], weight: "400", variable: "--JuliusSansOne" });
const JosefinSans = Josefin_Sans({ subsets: ["latin"], weight: ["300", "400"], variable: "--JosefinSans" });
const lato = Lato({ subsets: ["latin"], weight: ["400"], variable: "--lato" });
const vT323 = VT323({ subsets: ["latin"], weight: ["400"], variable: "--vT323" });
const rubik = Rubik({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--rubik" });
const albertExtraBold = localFont({ src: "../fonts/Albert Extrabold.otf", variable: "--albertExtraBold" })
const fakeReceipt = localFont({ src: "../fonts/Fake Receipt.otf", variable: "--fakeReceipt" })

export default function ProjectsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <ViewProjects className={`${JuliusSansOne.variable} ${JosefinSans.variable} ${lato.variable} ${albertExtraBold.variable} ${fakeReceipt.variable} ${vT323.variable} ${rubik.variable} reset`}>
            {children}
        </ViewProjects>
    );
}
