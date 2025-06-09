"use client"
import React, { useEffect, useRef, useState } from 'react'
import styles from "./pricing.module.css"
import { pricingFeatures, pricingTable, pricingTables } from '../../lib/pricingData'
import FourthButton from '../fourthButton/FourthButton'

export default function Pricing() {
    const containerRef = useRef<HTMLDivElement>(null!)

    const [viewingMore, viewingMoreSet] = useState(false)

    function scrollToRecommended(currentPosition: number) {
        containerRef.current.scrollLeft = currentPosition
    }

    return (
        <div style={{ display: "grid" }}>

            <div style={{ display: "grid", gap: "1rem", marginBlock: "1rem" }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem", justifyContent: "center", }}>
                    <p style={{}}>All plans include:</p>

                    <ul style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                        {[
                            {
                                name: "Maintenance"
                            },
                            // {
                            //     name: "Marketing"
                            // },
                            {
                                name: "Hosting Support"
                            }
                        ].map((each, eachIndex) => {
                            return (
                                <li key={eachIndex} style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                                    <div style={{ width: "fit-content", aspectRatio: "1/1", display: "grid", alignItems: "center", justifyItems: "center", position: "relative" }}>
                                        <div style={{ backgroundColor: "var(--color1)", position: "absolute", top: 0, left: 0, bottom: 0, right: 0, zIndex: -1, borderRadius: "50%", opacity: .05, scale: 1.2 }}></div>

                                        <span className="material-symbols-outlined" style={{ color: "var(--color1)", fontSize: "var(--iconSizeS)" }}>check</span>
                                    </div>

                                    {each.name}
                                </li>
                            )
                        })}
                    </ul>
                </div>

                <button onClick={() => { viewingMoreSet(prev => !prev) }}>
                    {viewingMore ? (
                        <span style={{ fontSize: "var(--iconSizeL)" }} className="material-symbols-outlined closeButton">
                            close
                        </span>
                    ) : <p className={"hoverUnderline"} style={{ color: "var(--color3)" }}>Show Details</p>}
                </button>

                {viewingMore && (
                    <div className={styles.morePricingCont}>
                        <p style={{ maxWidth: "75ch", marginTop: "1rem" }}>Price varies on invoice for domain name purchasing, database rentals, hosting costs</p>

                        <h3 className='supportingTitle2'>Maintenance</h3>

                        <ul className={styles.ruleCont}>
                            {[
                                {
                                    rule: "Adding Text",
                                    price: 0
                                },
                                {
                                    rule: "Removing Content",
                                    price: 0
                                },
                                {
                                    rule: "Adding a sale / discount / holiday banner",
                                    price: 0
                                },
                                {
                                    rule: "Adding a page",
                                    price: 50
                                },
                                {
                                    rule: "Adding a section",
                                    price: 20
                                },
                                {
                                    rule: "Editing the database",
                                    price: 20
                                },
                            ].map((each, eachIndex) => {
                                return (
                                    <li key={eachIndex}>
                                        {each.rule}

                                        {each.price === 0 ? <p style={{ fontWeight: "var(--fontWeightM)", textTransform: "uppercase", color: "var(--color3)" }}>free</p> : (
                                            <p className={styles.price}>
                                                <span style={{ alignSelf: "flex-start" }} className="material-symbols-outlined">
                                                    attach_money
                                                </span>

                                                {each.price}
                                            </p>
                                        )}
                                    </li>
                                )
                            })}
                        </ul>

                        <h3 className='supportingTitle2'>Marketing - Google / Facebook Ads</h3>

                        <ul className={styles.ruleCont}>
                            {pricingTables.map((eachPricingTable, eachPricingTableIndex) => {
                                return (
                                    <li key={eachPricingTableIndex}>
                                        {eachPricingTable.planName}

                                        <p className={styles.price}>
                                            <span style={{ alignSelf: "flex-start" }} className="material-symbols-outlined">
                                                attach_money
                                            </span>

                                            {eachPricingTable.marketingPrice}

                                            <span>/mo</span>
                                        </p>
                                    </li>
                                )
                            })}
                        </ul>

                        <p style={{ maxWidth: "75ch", marginTop: "1rem" }}>Our team excels at crafting compelling Ad Campaigns tailored to your business needs, ensuring your advertisements not only show results, but turn website visits into conversions.</p>


                        <h3 className='supportingTitle2'>Managed Hosting Cost</h3>
                        <ul className={styles.ruleCont}>
                            {pricingTables.map((eachPricingTable, eachPricingTableIndex) => {
                                return (
                                    <li key={eachPricingTableIndex}>
                                        {eachPricingTable.planName}

                                        <p className={styles.price}>
                                            <span style={{ alignSelf: "flex-start" }} className="material-symbols-outlined">
                                                attach_money
                                            </span>

                                            {eachPricingTable.managedHostingPrice}

                                            <span>/mo</span>
                                        </p>
                                    </li>
                                )
                            })}
                        </ul>

                        <h3 className='supportingTitle2'>Independent Hosting Support</h3>
                        <p><span style={{ color: "var(--color3)", fontWeight: "var(--fontWeightM)" }}>Free assistance </span>when setting up your own hosting solution.</p>

                        <h3 className='supportingTitle2'>Brand Creation</h3>
                        <ul className={styles.ruleCont}>
                            <li>
                                Full Package - Logos / Slogans / Brand Guide

                                <p className={styles.price}>
                                    <span style={{ alignSelf: "flex-start" }} className="material-symbols-outlined">
                                        attach_money
                                    </span>

                                    {300}
                                </p>
                            </li>
                        </ul>
                    </div>
                )}
            </div>


            <div ref={containerRef} className={`${styles.container} snap`} style={{ display: "grid", gap: "1rem", gridAutoFlow: "column", gridAutoColumns: "300px", overflowX: "auto", padding: "1rem", scrollBehavior: "smooth" }}>
                {pricingTables.map((eachTable, eachTableIndex) => {
                    return (
                        <DisplayPricingTable key={eachTableIndex} pricingTable={eachTable} startHovering={eachTableIndex === 2} recommended={eachTableIndex === 2} scrollToRecommended={scrollToRecommended} />
                    )
                })}
            </div>
        </div>
    )
}

function DisplayPricingTable({ pricingTable, startHovering, recommended, scrollToRecommended }: { pricingTable: pricingTable, startHovering?: boolean, recommended?: boolean, scrollToRecommended: (currentPosition: number) => void }) {
    const [hovering, hoveringSet] = useState(startHovering ?? false)

    const pricingTableRef = useRef<HTMLDivElement>(null!)

    useEffect(() => {
        if (recommended && window.innerWidth < 800) {
            scrollToRecommended(pricingTableRef.current.offsetLeft)
        }
    }, [])

    return (
        <div ref={pricingTableRef} className={`${styles.pricingTable} ${hovering && styles.pricingTableHovering}`} style={{}} onMouseEnter={() => { hoveringSet(true) }} onMouseLeave={() => { hoveringSet(false) }}>
            <div className={styles.gradient} style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0, backgroundImage: "linear-gradient(to bottom left, var(--color1), transparent,transparent,transparent, var(--color1))", transformOrigin: "top", translate: "0 -1rem", filter: "blur(5px)", scale: 1.3 }}></div>

            <p style={{ textTransform: "capitalize", fontSize: "var(--fontSizeM)", fontWeight: "var(--fontWeightM)" }}>{pricingTable.planName}</p>

            {recommended && (
                <p style={{ position: "absolute", top: 0, right: 0, margin: "1rem", backgroundColor: "var(--color1)", color: "#fff", padding: ".5rem", fontSize: "var(--fontSizeS)", borderRadius: "1rem", fontWeight: "bold" }}>Bestseller</p>
            )}

            <p style={{ minHeight: "120px" }}>{pricingTable.shortDescription}</p>

            <div style={{ display: "flex", fontSize: "var(--fontSizeEL)", alignItems: "center" }}>
                {pricingTable.pricing >= 1000 && (
                    <p style={{ fontSize: "var(--fontSizeS)" }}>From</p>
                )}

                <span style={{ fontSize: "var(--iconSizeL)" }} className="material-symbols-outlined">
                    attach_money
                </span>

                <p style={{ position: "relative", left: "-.4rem" }}>{pricingTable.pricing}</p>
            </div>

            <FourthButton link={`/contact?=${pricingTable.planName}`} text='Get Started' hovering={hovering} />

            <ul>
                {pricingFeatures.map((eachFeature, eachFeatureIndex) => {
                    const tableContainsFeature = pricingTable.features.find(tableFeatures => tableFeatures.id === eachFeature.name)
                    if (tableContainsFeature === undefined) return null

                    return (
                        <li key={eachFeatureIndex} style={{ display: "flex", gap: ".3rem", textTransform: "capitalize" }}>
                            <div style={{ position: "relative", aspectRatio: "1/1", }}>
                                <div style={{ aspectRatio: "1/1", backgroundColor: "var(--color1)", position: "absolute", top: 0, left: 0, bottom: 0, right: 0, zIndex: -1, borderRadius: "50%", opacity: .05, scale: 1.2 }}></div>

                                <span className="material-symbols-outlined" style={{ color: "var(--color1)" }}>check</span>
                            </div>

                            <p>{tableContainsFeature.modifier} {eachFeature.content}</p>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}