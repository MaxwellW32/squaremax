"use client"
import React, { useState } from 'react'
import toast from 'react-hot-toast'

export default function RecursiveConfirmationBox({ text, confirmationText, successMessage, runAction, float = false, icon }: { text: string, confirmationText: string, successMessage: string, runAction: () => void, float?: boolean, icon?: React.JSX.Element }) {
    const [confirmed, confirmedSet] = useState(false)
    return (
        <div style={{ display: "grid", alignContent: "flex-start", gap: "var(--spacingS)", position: "relative" }}>
            <button className='button1'
                onClick={() => {
                    confirmedSet(true)
                }}
            >
                {text}

                {icon}
            </button>

            {confirmed && (
                <div style={{ display: "grid", alignContent: "flex-start", gap: "var(--spacingS)", ...(float ? { position: "fixed", right: 0 } : { position: "relative" }), backgroundColor: "beige", padding: "var(--spacingR)", zIndex: 999 }}>
                    <p style={{ fontSize: "var(--fontSizeS)" }}>{confirmationText}</p>

                    <div style={{ display: "flex", flexWrap: "wrap", textTransform: "capitalize" }}>
                        <button className='button1'
                            onClick={() => {
                                runAction()

                                toast.success(successMessage)

                                confirmedSet(false)
                            }}
                        >yes</button>

                        <button className='button1'
                            onClick={() => { confirmedSet(false) }}
                        >cancel</button>
                    </div>
                </div>
            )}
        </div>
    )
}
