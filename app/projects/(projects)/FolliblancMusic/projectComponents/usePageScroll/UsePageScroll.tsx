"use client"
import { useEffect, useState } from 'react';

export default function usePageYScroll() {
    const [translateAmt, translateAmtSet] = useState(0)

    //add event listener
    useEffect(() => {
        document.addEventListener("scroll", handleScroll)

        return () => {
            document.removeEventListener("scroll", handleScroll)
        }
    }, [])

    function handleScroll() {
        translateAmtSet(window.scrollY)
    }

    return translateAmt
}
