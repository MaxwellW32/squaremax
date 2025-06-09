"use client"
import { retreiveFromLocalStorage, saveToLocalStorage } from '@/utility/saveToStorage'
import { useAtom } from 'jotai'
import React, { useEffect, useState, useMemo } from 'react'
import { cartItemsGlobal } from '../../lib/products'
import { formatter } from '@/utility/globalState'
import Image from 'next/image'
import Button1 from '../button1/Button1'
import styles from "./styles.module.css"

export default function Cart() {
    const [showingCart, showingCartSet] = useState(false)
    const [started, startedSet] = useState(false)
    const [cartItems, cartItemsSet] = useAtom(cartItemsGlobal)

    //get cart from storage
    useEffect(() => {
        const seenCart = retreiveFromLocalStorage("burgerCart")
        if (seenCart) {
            cartItemsSet(seenCart)
        }
        startedSet(true)
    }, [])

    //save items to storage
    useEffect(() => {
        if (started) {
            saveToLocalStorage("burgerCart", cartItems)
        }
    }, [cartItems])

    const totalPrice = useMemo(() => {
        if (cartItems.length === 0) return 0

        return cartItems.reduce((accumulatedTotal, eachProduct) => (eachProduct.product.price * (eachProduct.quantity > 0 ? eachProduct.quantity : 1)) + accumulatedTotal, 0)
    }, [cartItems])

    const AmountOfItems = useMemo(() => {
        if (cartItems.length === 0) return 0

        return cartItems.reduce((accumulatedTotal, eachProduct) => (eachProduct.quantity > 0 ? eachProduct.quantity : 1) + accumulatedTotal, 0)
    }, [cartItems])


    return (
        <>
            <button style={{ position: "relative" }} onClick={() => { showingCartSet(prev => !prev) }}>
                <span className="material-symbols-outlined">shopping_cart </span>

                {AmountOfItems > 0 && <p style={{ position: "absolute", top: 0, right: 0, translate: "50% -50%" }}>{AmountOfItems}</p>}
            </button>

            <div className={styles.cart} style={{ display: !showingCart ? "none" : "grid", gap: ".5rem", gridTemplateRows: "auto 1fr auto", zIndex: 99, position: "absolute", top: "100%", right: 0, maxHeight: "70vh", width: "min(400px, 100%)", backgroundColor: "#fff", color: "#000", padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: 'space-between', gap: "1rem", alignItems: "center" }}>
                    {cartItems.length > 0 && (
                        <button style={{ fontSize: "var(--fontSizeS)", cursor: "pointer", justifySelf: "flex-start", display: "flex", alignItems: "center", gap: ".2rem" }}
                            onClick={() => {
                                cartItemsSet([])
                                showingCartSet(false)
                            }}
                        >
                            <span className="material-symbols-outlined">
                                delete_sweep
                            </span>

                            Clear Cart
                        </button>
                    )}

                    <button style={{ justifySelf: "flex-end" }} onClick={() => { showingCartSet(false) }}>
                        <span className="material-symbols-outlined">close </span>
                    </button>
                </div>

                {cartItems.length === 0 ? (
                    <p>No Items</p>
                ) : (
                    <>
                        <div style={{ overflowY: "auto", display: "grid", gap: '.5rem' }}>
                            {cartItems.map(eachCartObj => {
                                return (
                                    <div key={eachCartObj.product.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: ".5rem", borderBottom: "1px solid #000" }}>
                                        <Image alt={`${eachCartObj.product.title}`} src={eachCartObj.product.image} width={50} height={50} style={{ objectFit: "cover" }} />

                                        <div style={{ display: "grid", gap: ".5rem", paddingRight: "1rem" }}>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "space-between" }}>
                                                <p style={{ whiteSpace: "wrap" }}>{eachCartObj.product.title}</p>

                                                <p>{formatter.format(eachCartObj.product.price * (eachCartObj.quantity > 0 ? eachCartObj.quantity : 1))}</p>
                                            </div>

                                            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr" }}>
                                                <div style={{ display: "flex", gap: ".5rem", }}>
                                                    <button
                                                        onClick={() => {
                                                            cartItemsSet(prevCart => {
                                                                const newCart = prevCart.map(eachSmallCartObj => {
                                                                    if (eachSmallCartObj.product.id === eachCartObj.product.id) {
                                                                        eachSmallCartObj.quantity--

                                                                        if (eachSmallCartObj.quantity < 1) {
                                                                            eachSmallCartObj.quantity = 1
                                                                        }
                                                                    }

                                                                    return eachSmallCartObj
                                                                })


                                                                return newCart
                                                            })
                                                        }}
                                                    >
                                                        <span style={{ fontSize: "var(--iconSizeS)" }} className="material-symbols-outlined">
                                                            remove
                                                        </span>
                                                    </button>

                                                    <input style={{ width: "20%" }} type='number' value={`${eachCartObj.quantity}`}
                                                        onChange={(e) => {
                                                            cartItemsSet(prevCart => {
                                                                const newCart = prevCart.map(eachSmallCartObj => {
                                                                    if (eachSmallCartObj.product.id === eachCartObj.product.id) {
                                                                        eachSmallCartObj.quantity = parseInt(e.target.value)
                                                                    }

                                                                    return eachSmallCartObj
                                                                })

                                                                return newCart
                                                            })
                                                        }}
                                                    />


                                                    <button
                                                        onClick={() => {
                                                            cartItemsSet(prevCart => {
                                                                const newCart = prevCart.map(eachSmallCartObj => {
                                                                    if (eachSmallCartObj.product.id === eachCartObj.product.id) {
                                                                        eachSmallCartObj.quantity++
                                                                    }

                                                                    return eachSmallCartObj
                                                                })

                                                                return newCart
                                                            })
                                                        }}
                                                    >
                                                        <span style={{ fontSize: "var(--iconSizeS)" }} className="material-symbols-outlined">
                                                            add
                                                        </span>
                                                    </button>
                                                </div>

                                                <button style={{ justifySelf: "flex-end" }}
                                                    onClick={() => {
                                                        cartItemsSet(prevCart => {
                                                            return prevCart.filter(eachSmallCartObj => eachSmallCartObj.product.id !== eachCartObj.product.id)
                                                        })
                                                    }}
                                                >
                                                    <span style={{ fontSize: "var(--iconSizeS)" }} className="material-symbols-outlined">
                                                        delete
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div style={{ display: "grid", gap: '.5rem' }}>
                            <p style={{ justifySelf: "flex-end" }}>Total: {formatter.format(totalPrice)}</p>

                            <Button1 text='check Out' link='' style={{ justifySelf: "center" }} />
                        </div>
                    </>
                )}
            </div>
        </>
    )
}
