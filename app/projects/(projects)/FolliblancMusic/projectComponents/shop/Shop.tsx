import { formatter } from '@/utility/globalState'
import React from 'react'
import styles from "./styles.module.css"
import Image from 'next/image'
import Link from 'next/link'

type item = {
    img: string,
    name: string,
    price: number,
    link: string
}

const items: item[] = [
    {
        img: "/projects/folliblancMusic/shirt1.png",
        name: "Midnight Vibes Tee",
        price: 40,
        link: ""
    },
    {
        img: "/projects/folliblancMusic/shirt2.png",
        name: "Lunar Echo Tee",
        price: 70,
        link: ""
    },
    {
        img: "/projects/folliblancMusic/shirt3.png",
        name: "Rose Harmony Tee",
        price: 90,
        link: ""
    },
    {
        img: "/projects/folliblancMusic/shirt4.png",
        name: "Storm Groove Tee",
        price: 50,
        link: ""
    },
    {
        img: "/projects/folliblancMusic/shirt5.png",
        name: "Crimson Beat Tee",
        price: 30,
        link: ""
    },
    {
        img: "/projects/folliblancMusic/shirt6.png",
        name: "Aqua Melody Tee",
        price: 60,
        link: ""
    }
]
export default function Shop() {
    return (
        <div className={styles.cont} style={{}}>
            {items.map((eachItem, eachItemIndex) => {
                return (
                    <div key={eachItemIndex} className={styles.item} style={{}}>
                        <Image alt={`${eachItem.name}'s image`} src={eachItem.img} width={300} height={300} style={{ objectFit: "contain", width: "80%", aspectRatio: "1/1" }} />


                        <Link href={eachItem.link} className={styles.link}>
                            <p>More<br />Info</p>

                            <div className={styles.hexadecagon}>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>
                        </Link>

                        <h3>{eachItem.name}</h3>

                        <p>{formatter.format(eachItem.price)}</p>

                        <div className={styles.background} style={{ animation: "rotate 1s infinite both alternate ease-in-out" }}></div>
                    </div>
                )
            })}
        </div>
    )
}
