"use client"
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import styles from "./slideShow.module.css"
import MainButton from '../mainButton/MainButton'

const slides = [
    {
        title: "Wedding Bliss",
        name: "Emma & Liam",
        supportingText: "Capturing the magic of your special day with timeless elegance.",
        image: "/projects/luminousLens/wedding.jpg",
        buttonText: "View Gallery",
    },
    {
        title: "Corporate Headshots",
        name: "Elite Agency",
        supportingText: "Professional headshots that make a lasting impression.",
        image: "/projects/luminousLens/corporate.jpg",
        buttonText: "Explore More",
    },
    {
        title: "Family Portraits",
        name: "The Johnsons",
        supportingText: "Cherishing family moments with beautiful, candid portraits.",
        image: "/projects/luminousLens/family.jpg",
        buttonText: "See More",
    },
    {
        title: "Event Coverage",
        name: "Tech Conference 2024",
        supportingText: "Comprehensive coverage of your events, capturing every detail.",
        image: "/projects/luminousLens/conference.jpg",
        buttonText: "Learn More",
    },
    {
        title: "Product Photography",
        name: "Artisan Goods",
        supportingText: "Showcasing your products with high-quality, detailed images.",
        image: "/projects/luminousLens/product.jpg",
        buttonText: "View Collection",
    },
    {
        title: "Lifestyle Shoot",
        name: "Urban Living",
        supportingText: "Dynamic lifestyle photography that tells your story.",
        image: "/projects/luminousLens/fun.jpg",
        buttonText: "Discover More",
    },
    {
        title: "Commercial Advertising",
        name: "Fashion Forward",
        supportingText: "Creative and impactful images for your advertising campaigns.",
        image: "/projects/luminousLens/ad.jpg",
        buttonText: "See Portfolio",
    },
    {
        title: "Newborn Photography",
        name: "Baby Noah",
        supportingText: "Capturing the precious first moments of life with tender care.",
        image: "/projects/luminousLens/newborn.jpg",
        buttonText: "View Photos",
    },
    {
        title: "Real Estate",
        name: "Luxury Homes",
        supportingText: "Showcasing properties with stunning real estate photography.",
        image: "/projects/luminousLens/home.jpg",
        buttonText: "Explore Listings",
    },
    {
        title: "Food Photography",
        name: "Gourmet Delights",
        supportingText: "Deliciously crafted food photography that tantalizes the senses.",
        image: "/projects/luminousLens/food.jpg",
        buttonText: "See Dishes",
    }
];

export default function SlideShow() {
    const [currentIndex, currentIndexSet] = useState(Math.floor(Math.random() * slides.length))
    const [transitionClick, transitionClickSet] = useState(true)
    const [userClicked, userClickedSet] = useState(false)
    const [goingDirection, goingDirectionSet] = useState<"left" | "right">("right")

    const userClickedDebounce = useRef<NodeJS.Timeout>()

    //auto scroll
    useEffect(() => {
        if (userClicked) return

        const myInterval = setInterval(() => {
            handleSeek("next")
        }, 5000)

        return () => { clearInterval(myInterval) }
    }, [userClicked])

    function handleSeek(option: "next" | "prev") {
        if (option === "next") {
            currentIndexSet(prevIndex => {
                let newIndex = prevIndex + 1

                if (newIndex > slides.length - 1) {
                    newIndex = 0
                }

                return newIndex
            })

            goingDirectionSet("right")
        } else {
            currentIndexSet(prevIndex => {
                let newIndex = prevIndex - 1

                if (newIndex < 0) {
                    newIndex = slides.length - 1
                }

                return newIndex
            })

            goingDirectionSet("left")
        }

        transitionClickSet(false)
        setTimeout(() => {
            transitionClickSet(true)
        }, 1);
    }

    function handleClick(option: "next" | "prev") {
        handleSeek(option)

        userClickedSet(true)

        if (userClickedDebounce.current) clearTimeout(userClickedDebounce.current)
        userClickedDebounce.current = setTimeout(() => {
            userClickedSet(false)
        }, 30000);
    }

    function getInRange(option: "minus" | "add") {
        if (option === "minus") {

            let val = currentIndex - 1
            if (val < 0) val = slides.length - 1

            return val
        } else {
            let val = currentIndex + 1
            if (val > slides.length - 1) val = 0

            return val
        }
    }

    return (
        <div style={{ height: "100svh", display: "grid", alignContent: "flex-end", padding: "1rem", position: "relative", overflow: "hidden" }}>
            {slides.map((eachSlide, eachSlideIndex) => {
                return (
                    <Image key={eachSlideIndex} className={`${eachSlideIndex === currentIndex && styles.fadeIn}`} alt={`${eachSlide.name} image`} priority={eachSlideIndex === currentIndex} src={eachSlide.image} width={1500} height={1500} style={{ objectFit: "cover", position: "absolute", width: "100%", height: "100%", zIndex: eachSlideIndex === currentIndex ? 2 : eachSlideIndex === (goingDirection === "right" ? getInRange("minus") : getInRange("add")) ? 1 : "", }} />
                )
            })}

            <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 2 }}></div>

            <div style={{ padding: "3rem", display: "grid", gap: ".5rem", justifyItems: "flex-end", zIndex: 2 }}>
                <h2 className={`${styles.opacity} ${transitionClick && styles.slideUp}`}>{slides[currentIndex].title}</h2>

                <p className={`${styles.opacity} ${styles.largeText} ${transitionClick && styles.slideUp}`} style={{ fontSize: "var(--extraLargeFontSize)", animationDelay: "500ms" }}>{slides[currentIndex].name}</p>

                <p className={`${styles.opacity} ${transitionClick && styles.slideUp}`} style={{ animationDelay: "1000ms" }}>{slides[currentIndex].supportingText}</p>

                <div className={`${styles.opacity} ${transitionClick && styles.slideUp}`} style={{ animationDelay: "1250ms", marginTop: ".5rem" }}>
                    <MainButton link={""} text={slides[currentIndex].buttonText} />
                </div>
            </div>

            <div className={styles.buttonCont} style={{ position: "relative", zIndex: 2, display: "flex", gap: ".1rem" }}>
                <button onClick={() => { handleClick("prev") }}>
                    <span className="material-symbols-outlined">
                        chevron_left
                    </span>
                </button>

                <button onClick={() => { handleClick("next") }}>
                    <span className="material-symbols-outlined">
                        chevron_right
                    </span>
                </button>
            </div>
        </div>
    )
}
