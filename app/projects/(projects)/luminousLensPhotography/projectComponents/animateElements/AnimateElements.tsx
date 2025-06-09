"use client"
import React from 'react'
import styles from "./animate.module.css"
import { useInView } from 'react-intersection-observer'

export default function AnimateElements({ children, delay = 100, duration = 1500, animationOption, ...elProps }: { children: React.ReactNode, delay?: number, duration?: number, animationOption: "slideUp" | "slideLeft" | "fadeIn" } & React.HTMLAttributes<HTMLDivElement>) {
    const { ref, inView } = useInView()

    return (
        <div {...elProps} ref={ref} className={`${animationOption === "slideUp" && styles.slideUp} ${animationOption === "slideLeft" && styles.slideLeft}  ${animationOption === "fadeIn" && styles.fadeIn} ${elProps.className}`} style={{ "--animationPlayState": inView ? "running" : "", "--duration": `${duration}ms`, ...elProps?.style } as React.CSSProperties}>
            {React.Children.map(children, (child, index) => {
                const delayTime = `${index * delay}ms`;

                // @ts-expect-error expected here
                return React.cloneElement(child, {
                    style: {
                        // @ts-expect-error expected here
                        ...child.props.style,
                        animationDelay: delayTime,
                        animationPlayState: inView ? "running" : ""
                    },
                });
            })}
        </div>
    )
}
