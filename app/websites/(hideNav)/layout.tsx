"use client"

import { useEffect } from "react";

export default function HideNavLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    //hide it
    const seenNav = document.querySelector("#mainNav")
    if (seenNav === null) return

    const footerNav = document.querySelector("#footerNav")
    if (footerNav === null) return

    seenNav.classList.add("hideNav")
    footerNav.classList.add("hideNav")

    return () => {
      seenNav.classList.add("hideNav")
      footerNav.classList.add("hideNav")
    }
  }, [])

  return children
}
