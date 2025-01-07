import { navBarsType } from '@/types';
import Link from 'next/link';
import React from 'react';
import './page.css';

export default function Nav({ data }: { data: navBarsType }) {
    return (
        <nav className="nav">
            <ul className="nav-menu">
                {data.menu.map((menuItem, menuItemIndex) => (
                    <li key={menuItemIndex} className="nav-item">
                        <Link href={menuItem.link} className="nav-link">
                            {menuItem.label}
                        </Link>
                        {menuItem.subMenu && menuItem.subMenu.length > 0 && (
                            <ul className="nav-submenu">
                                {menuItem.subMenu.map((subMenuItem, subMenuItemIndex) => (
                                    <li key={subMenuItemIndex} className="submenu-item">
                                        <Link href={subMenuItem.link} className="submenu-link">
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
