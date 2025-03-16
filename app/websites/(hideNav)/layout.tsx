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

    seenNav.classList.add("hideNav")

    return () => {
      const seenNav = document.querySelector("#mainNav")
      if (seenNav === null) return

      seenNav.classList.remove("hideNav")
    }
  }, [])

  return children
}
