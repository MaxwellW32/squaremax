"use client"
import Link from 'next/link'
import React, { useState } from 'react'
import styles from "./page.module.css"
import { searchObj, website } from '@/types'
import Search from '@/components/search/Search'
import { getWebsitesFromUser } from '@/serverFunctions/handleWebsites'

export default function Page() {
    const [websiteSearchObj, websiteSearchObjSet] = useState<searchObj<website>>({
        searchItems: [],
    })

    return (
        <main className={styles.main}>
            <Link href={`/websites/new`} style={{ justifySelf: "flex-end" }}>
                <button className='button3'>Add Website</button>
            </Link>

            <section>
                <h1>websites</h1>

                <Search
                    searchObj={websiteSearchObj}
                    searchObjSet={websiteSearchObjSet}
                    searchFunc={async (seenFilters) => {
                        return await getWebsitesFromUser({ ...seenFilters }, websiteSearchObj.limit, websiteSearchObj.offset)
                    }}
                    showPage={true}
                    searchFilters={{
                        name: {
                            value: ""
                        }
                    }}
                    autoSearch={true}
                />

                <div style={{ display: "grid", alignContent: "flex-start", paddingBlock: "1rem" }}>
                    {websiteSearchObj.loading && (
                        <p>loading...</p>
                    )}

                    {websiteSearchObj.searchItems.length > 0 && (
                        <div style={{ display: "grid", alignContent: "flex-start", gap: "var(--spacingR)", gridAutoFlow: "column", gridAutoColumns: "min(90%, 350px)", overflow: "auto" }} className='snap'>
                            {websiteSearchObj.searchItems.map(eachWebsite => {
                                return (
                                    <div key={eachWebsite.id} style={{ display: "grid", alignContent: "flex-start", gap: "var(--spacingR)" }}>
                                        <h2>{eachWebsite.name}</h2>

                                        <Link href={`/websites/edit/${eachWebsite.id}`} style={{ justifySelf: "flex-end" }}>
                                            <button className='button3'>edit</button>
                                        </Link>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </section>
        </main>
    )
}
