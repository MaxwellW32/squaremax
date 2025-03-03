"use client"
import React, { useState } from 'react'
import toast from 'react-hot-toast'

export default function ConfirmationBox({ text, confirmationText, successMessage, runAction, float = false }: { text: string, confirmationText: string, successMessage: string, runAction: () => void, float?: boolean }) {
    const [confirmed, confirmedSet] = useState(false)
    return (
        <div style={{ display: "grid", alignContent: "flex-start", gap: ".5rem", position: "relative" }}>
            <button className='mainButton'
                onClick={() => {
                    confirmedSet(true)
                }}
            >
                {text}
            </button>

            {confirmed && (
                <div style={{ display: "grid", alignContent: "flex-start", gap: ".5rem", position: float ? "fixed" : "relative", backgroundColor: "beige", padding: "1rem" }}>
                    <p style={{ fontSize: "var(--fontSizeS)" }}>{confirmationText}</p>

                    <div style={{ display: "flex", flexWrap: "wrap", textTransform: "capitalize" }}>
                        <button className='mainButton'
                            onClick={() => {
                                runAction()

                                toast.success(successMessage)

                                confirmedSet(false)
                            }}
                        >yes</button>

                        <button className='mainButton'
                            onClick={() => { confirmedSet(false) }}
                        >cancel</button>
                    </div>
                </div>
            )}
        </div>
    )
}
