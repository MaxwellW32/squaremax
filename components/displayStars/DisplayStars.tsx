import React from 'react'

export default function DisplayStars({ starRating }: { starRating: number }) {
    const amtOfFullStars = 5

    const halfStarPresent = starRating % 1 >= 0.5

    const makeStarArray = () => {
        const fullSvgArray: JSX.Element[] = []

        const fullstar = <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512"><path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" /></svg>

        const halfStar = <svg style={{ fill: "var(--color1)" }} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512"><path d="M320 376.4l.1-.1 26.4 14.1 85.2 45.5-16.5-97.6-4.8-28.7 20.7-20.5 70.1-69.3-96.1-14.2-29.3-4.3-12.9-26.6L320.1 86.9l-.1 .3V376.4zm175.1 98.3c2 12-3 24.2-12.9 31.3s-23 8-33.8 2.3L320.1 439.8 191.8 508.3C181 514 167.9 513.1 158 506s-14.9-19.3-12.9-31.3L169.8 329 65.6 225.9c-8.6-8.5-11.7-21.2-7.9-32.7s13.7-19.9 25.7-21.7L227 150.3 291.4 18c5.4-11 16.5-18 28.8-18s23.4 7 28.8 18l64.3 132.3 143.6 21.2c12 1.8 22 10.2 25.7 21.7s.7 24.2-7.9 32.7L470.5 329l24.6 145.7z" /></svg>

        for (let index = 0; index < amtOfFullStars; index++) {
            fullSvgArray.push(fullstar)
        }

        if (halfStarPresent) {
            fullSvgArray.pop()
            fullSvgArray.push(halfStar)
        }

        return fullSvgArray
    }

    const starArray = makeStarArray()

    return (
        <div style={{ display: "flex", gap: "var(--spacingEL)", justifyContent: "center" }}>
            {starArray.map((eachSvg, svgIndex) => (
                <div key={svgIndex} style={{ fill: svgIndex + 1 <= starRating ? "var(--color1)" : "white" }}>
                    {eachSvg}
                </div>
            ))}
        </div>
    )
}
