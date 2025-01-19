import { navBarsType } from '@/types';
import React from 'react';
import './page.css';

export default function Nav4({ data }: { data: navBarsType }) {
    return (
        <nav {...data.mainElProps} className={`nav${data.styleId} ${data.mainElProps?.className}`}>
            {data.menu[0]?.label}
        </nav>
    );
}
