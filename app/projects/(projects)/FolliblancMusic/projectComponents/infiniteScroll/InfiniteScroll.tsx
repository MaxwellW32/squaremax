"use client"
import React, { useMemo, } from 'react'
import styles from "./infinitescroll.module.css"

export default function InfiniteScroll(
    {
        timeToLoop = 10000,
        amountOfCarts = 1,
        respondToHover = true,
        items,
        trainProps,
        ...elProps
    }: {
        timeToLoop?: number,
        amountOfCarts?: number,
        respondToHover?: boolean,
        items: JSX.Element[],
        trainProps?: React.HtmlHTMLAttributes<HTMLDivElement>,
    } & React.HtmlHTMLAttributes<HTMLDivElement>) {

    const itemsArr = useMemo(() => {
        const newArr: JSX.Element[] = []

        for (let index = 0; index < amountOfCarts; index++) {
            if (index > 0) {
                const hiddenItems = items.map(eachItem => {
                    return React.cloneElement(eachItem, { 'aria-hidden': true });
                });

                newArr.push(...hiddenItems);

            } else {
                newArr.push(...items)
            }
        }

        return newArr
    }, [items, amountOfCarts])

    return (
        <div {...elProps} style={{ overflowX: "hidden", ...elProps?.style }}>
            <div className={`${styles.track} ${respondToHover && styles.trackHover}`} style={{ "--timeToLoop": `${timeToLoop}ms`, display: "flex", alignItems: "center", width: "fit-content" } as React.CSSProperties}>
                <div  {...trainProps} className={`${styles.train} ${trainProps?.className}`}>
                    {itemsArr.map((eachItem, eachItemIndex) => {
                        return (
                            <React.Fragment key={eachItemIndex}>
                                {eachItem}
                            </React.Fragment>
                        )
                    })}
                </div>

                <div  {...trainProps} className={`${styles.train} ${trainProps?.className}`} aria-hidden={true} >
                    {itemsArr.map((eachItem, eachItemIndex) => {
                        return (
                            <React.Fragment key={eachItemIndex}>
                                {eachItem}
                            </React.Fragment>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
