"use client"
import ScreenHide from "@/components/screenHide/ScreenHide";
import { controlNavView } from "@/utility/utility";
import { useEffect, useState } from "react";

export default function HideNavLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [hidden, hiddenSet] = useState(false)

  //hide navs
  useEffect(() => {
    //hide
    controlNavView(false)
    hiddenSet(true)

    return () => {
      controlNavView(true)
      hiddenSet(false)
    }
  }, [])

  return (
    <>
      <ScreenHide hidden={hidden} />

      {hidden && children}
    </>
  )
}
