"use client"
import React, { useEffect, useState, useRef } from 'react';
import usePageYScroll from '../usePageScroll/UsePageScroll';

export default function Parallax({ children, speed, ...elProps }: { children: React.ReactNode, speed: number } & React.HtmlHTMLAttributes<HTMLDivElement>) {
    const translateAmt = usePageYScroll();
    const [offsetTop, setOffsetTop] = useState(0);
    const ref = useRef<HTMLDivElement>(null!);

    useEffect(() => {
        setOffsetTop(ref.current.offsetTop);
    }, []);

    const translateY = (translateAmt - offsetTop) * speed;

    return (
        <div ref={ref} {...elProps} style={{ translate: `0 ${translateY}px`, ...elProps?.style }}>
            {children}
        </div>
    );
};
