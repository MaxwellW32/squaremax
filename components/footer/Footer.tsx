import React from 'react'
// import Logo from '../logo/Logo'
// import Socials from '../socials/Socials'
// import { companyInfo } from '@/lib/companyInfo'
// import { blogData } from '@/lib/blogData'
// import Image from 'next/image'
import Link from 'next/link'
import styles from "./page.module.css"
import { servicesData } from '@/lib/servicesData'

export default function Footer() {
    return (
        <footer id='footerNav' style={{ padding: "var(--spacingEL) var(--spacingR)", backgroundColor: "var(--bg1)", color: "#fff", display: "grid", gap: "var(--spacingR)", zIndex: 999 }}>
            <ul className={styles.footerUL}>
                {[
                    {
                        title: "Products",
                        links: servicesData.map((eachService,) => {
                            return {
                                name: eachService.name,
                                link: `/services/${eachService.slug}`
                            }
                        })
                    },
                    {
                        title: "Resources",
                        links: [
                            {
                                name: "Privacy Policy",
                                link: "/privacyPolicy"
                            }
                        ]
                    },
                    {
                        title: "Company",
                        links: [
                            {
                                name: "About Us",
                                link: "/aboutUs"
                            },
                            {
                                name: "blogs",
                                link: "/blog"
                            }
                        ]
                    },
                    {
                        title: "Help",
                        links: [
                            {
                                name: "Contact Us",
                                link: "/contact"
                            }
                        ]
                    },
                ].map((eachNavLink, eachNavLinkIndex) => {
                    return (
                        <li key={eachNavLinkIndex}>
                            <h3>{eachNavLink.title}</h3>

                            <ul className={styles.footerSubUL}>
                                {eachNavLink.links.map((eachSubLink, eachSubLinkIndex) => {
                                    return (
                                        <li key={eachSubLinkIndex}>
                                            <Link href={eachSubLink.link}>{eachSubLink.name}</Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        </li>
                    )
                })}
            </ul>

            <div style={{ padding: "var(--spacingR)", borderTop: "1px solid var(--shade2)", display: "flex", justifyContent: "center", gap: "var(--spacingR)" }}>
                <p>Copyright © SquareMax all rights reserved.</p>

                {/* <ul style={{ display: "flex", flexWrap: 'wrap', gap: "var(--spacingR)" }}>
                    {[{
                        link: "/aboutUs",
                        name: "About Us"
                    },
                    {
                        link: "/privacyPolicy",
                        name: "Privacy Policy"
                    },
                    {
                        link: "/services",
                        name: "Services"
                    }].map((eachLink, eachLinkIndex) => {
                        return (
                            <Link href={eachLink.link} key={eachLinkIndex}>{eachLink.name}</Link>
                        )
                    })}
                </ul> */}
            </div>
        </footer>
    )
}







// <div className={styles.listCont} style={{ display: "grid", gap: "var(--spacingR)", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))" }}>
// <div style={{ display: "grid", gap: "var(--spacingR)", alignContent: 'flex-start' }}>
//     <Logo />

//     <p>Here to fit all your needs</p>

//     <Socials style={{ justifyContent: "flex-start", paddingLeft: "0rem" }} />
// </div>

// <div>
//     <h2>Contact Information</h2>

//     <div style={{ display: "grid", gap: "var(--spacingR)" }}>
//         <p><b>Adress: </b>{companyInfo.address}</p>
//         <p><b>Phone: </b>{companyInfo.number}</p>
//         <p><b>Email: </b>{companyInfo.email}</p>
//     </div>
// </div>

// <div>
//     <h2>Recent Posts</h2>

//     <div style={{ display: "grid", gap: "var(--spacingR)", }}>
//         {blogData.sort((a, b) => (b.datePosted as any) - (a.datePosted as any)).slice(0, 2).map((eachBlog, eachBlogIndex) => {
//             return (
//                 <Link href={`/blog/${eachBlog.slug}`} key={eachBlogIndex} style={{ display: "flex", gap: "var(--spacingR)" }}>
//                     <Image alt={`${eachBlog.title}'s image`} src={eachBlog.coverImage} height={100} width={100} style={{ objectFit: "cover" }} />


//                     <div style={{ flex: "1 1 300px", display: "grid", gap: "var(--spacingR)" }}>
//                         <h3 className='hoverHighlight'>{eachBlog.title}</h3>

//                         <p>{eachBlog.datePosted.toLocaleDateString('en-US', {
//                             month: 'long',
//                             day: 'numeric',
//                             year: 'numeric'
//                         })}</p>
//                     </div>
//                 </Link>
//             )
//         })}
//     </div>
// </div>
// </div>