import { navBarsType } from '@/types';
import Link from 'next/link';
import React from 'react';
import './page.css';

export default function Nav({ data }: { data: navBarsType }) {
    return (
        <nav {...data.mainElProps} className={`${`nav`} ${data.mainElProps?.className}`}>
            <ul className={`navMenu`}>
                {data.menu.map((menuItem, menuItemIndex) => (
                    <li key={menuItemIndex} className={`navItem`}>
                        <Link href={menuItem.link} className={`navLink`}>
                            {menuItem.label}
                        </Link>

                        {menuItem.subMenu && menuItem.subMenu.length > 0 && (
                            <ul className={`navSubmenu`}>
                                {menuItem.subMenu.map((subMenuItem, subMenuItemIndex) => (
                                    <li key={subMenuItemIndex} className={`submenuItem`}>
                                        <Link href={subMenuItem.link} className={`submenuLink`}>
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
