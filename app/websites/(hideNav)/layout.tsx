"use client"

import { useEffect, useState } from "react";

export default function HideNavLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [navHidden, navHiddenSet] = useState(false)

  useEffect(() => {
    navHiddenSet(true)

    return () => {
      navHiddenSet(false)
    }
  }, [])

  useEffect(() => {
    if (navHidden) {
      //hide it
      const seenNav = document.querySelector("#mainNav")
      if (seenNav === null) return

      seenNav.classList.add("hideNav")

    } else {
      //unhide
      const seenNav = document.querySelector("#mainNav")
      if (seenNav === null) return

      seenNav.classList.remove("hideNav")
    }

    return () => {
      const seenNav = document.querySelector("#mainNav")
      if (seenNav === null) return

      seenNav.classList.remove("hideNav")
    }
  }, [navHidden])

  return (
    <>
      {children}

      <div style={{}}>
        <button className="mainButton" style={{ position: "fixed", bottom: 0, left: 0 }}
          onClick={() => {
            navHiddenSet(prev => !prev)
          }}
        >click</button>
      </div>
    </>
  );
}
