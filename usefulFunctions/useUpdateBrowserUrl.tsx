import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function useUpdateBrowserUrl({ baseLink, activePage, activePageSet }: { baseLink: string, activePage: string | null, activePageSet: React.Dispatch<React.SetStateAction<string | null>> }) {
    const pathname = usePathname()

    //on first load set the active page
    useEffect(() => {
        const difference = pathname.slice(baseLink.length, undefined)
        const pathArray = difference.split("/")
        const currentPage = pathArray[pathArray.length - 1]

        activePageSet(currentPage)
    }, [])


    //write changes to href
    useEffect(() => {
        if (activePage === null) return
        const completeUrl = `${baseLink}/${activePage}`

        // console.log(`$activePage`, completeUrl);
        window.history.replaceState({}, "", completeUrl);
    }, [activePage])

    return null
}
