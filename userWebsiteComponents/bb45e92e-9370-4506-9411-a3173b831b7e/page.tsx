import { navBarsType } from '@/types';
import Link from 'next/link';
import React from 'react';
import './page.css';

export default function Nav({ data }: { data: navBarsType }) {
    return (
        <nav {...data.mainElProps} className={`${data.styleId}nav ${data.mainElProps?.className}`}>
            <ul className={`${data.styleId}navMenu`}>
                {data.menu.map((menuItem, menuItemIndex) => (
                    <li key={menuItemIndex} className={`${data.styleId}navItem`}>
                        <Link href={menuItem.link} className={`${data.styleId}navLink`}>
                            {menuItem.label}
                        </Link>

                        {menuItem.subMenu && menuItem.subMenu.length > 0 && (
                            <ul className={`${data.styleId}navSubmenu`}>
                                {menuItem.subMenu.map((subMenuItem, subMenuItemIndex) => (
                                    <li key={subMenuItemIndex} className={`${data.styleId}submenuItem`}>
                                        <Link href={subMenuItem.link} className={`${data.styleId}submenuLink`}>
                                            {subMenuItem.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
}
