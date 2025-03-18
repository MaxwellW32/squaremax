"use client";
import { navBarsDataType } from "@/types";
import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import "@/app/globals.css";

export default function Nav({ data }: { data: navBarsDataType }) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav {...data.mainElProps} className={`nav${data.styleId} ${data.mainElProps?.className ?? ""}`}>
            {/* Logo Section */}
            <div className={`navLogoContainer${data.styleId}`}>
                {data.logos.map((logo, index) => (
                    <Link key={index} href={logo.link?.url || "#"} className={`navLogoLink${data.styleId}`}>
                        <Image
                            src={logo.src}
                            alt={logo.alt}
                            width={logo.size.type === "noFill" ? logo.size.width : undefined}
                            height={logo.size.type === "noFill" ? logo.size.height : undefined}
                            fill={logo.size.type === "fill"}
                            priority={logo.priority !== null ? logo.priority : undefined}
                            className={`navLogo${data.styleId}`}
                        />
                    </Link>
                ))}
            </div>

            {/* Hamburger Menu (Mobile) */}
            <button className={`menuToggle${data.styleId}`} onClick={() => setMenuOpen(!menuOpen)}>
                ☰
            </button>

            {/* Navigation Links */}
            <ul className={`navMenu${data.styleId} ${menuOpen ? `navMenuOpen${data.styleId}` : ""}`}>
                {data.menu.map((menuItem, menuItemIndex) => (
                    <li key={menuItemIndex} className={`navItem${data.styleId}`}>
                        <Link href={menuItem.link.url} target={menuItem.link.target !== null ? menuItem.link.target : undefined} className={`navLink${data.styleId}`}>
                            {menuItem.title}
                        </Link>

                        {menuItem.subMenu.length > 0 && (
                            <ul className={`navSubmenu${data.styleId}`}>
                                {menuItem.subMenu.map((subMenuItem, subMenuItemIndex) => (
                                    <li key={subMenuItemIndex} className={`submenuItem${data.styleId}`}>
                                        <Link href={subMenuItem.link.url} className={`submenuLink${data.styleId}`}>
                                            {subMenuItem.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>

            {/* Contact & Social Media */}
            <div className={`navExtras${data.styleId}`}>
                <div className={`navContactContainer${data.styleId}`}>
                    {data.contactInfo.map((contact, index) => (
                        <Link key={index} href={contact.link?.url || "#"} className={`navContactItem${data.styleId}`}>
                            {contact.image && (
                                <Image
                                    src={contact.image.src}
                                    alt={contact.image.alt}
                                    width={contact.image.size.type === "noFill" ? contact.image.size.width : undefined}
                                    height={contact.image.size.type === "noFill" ? contact.image.size.height : undefined}
                                    fill={contact.image.size.type === "fill"}
                                    className={`contactIcon${data.styleId}`}
                                />
                            )}
                            <span>{contact.title}</span>
                        </Link>
                    ))}
                </div>

                <div className={`navSocialMediaContainer${data.styleId}`}>
                    {data.socialMedia.map((social, index) => (
                        <Link key={index} href={social.link.url} className={`navSocialItem${data.styleId}`}>
                            <Image
                                src={social.image.src}
                                alt={social.image.alt}
                                width={social.image.size.type === "noFill" ? social.image.size.width : undefined}
                                height={social.image.size.type === "noFill" ? social.image.size.height : undefined}
                                fill={social.image.size.type === "fill"}
                                className={`socialIcon${data.styleId}`}
                            />
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}
