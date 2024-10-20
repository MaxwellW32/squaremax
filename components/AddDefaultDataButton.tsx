"use client"
import { addDefaultData } from '@/serverFunctions/handleDefaultData'
import React from 'react'

export default function AddDefaultDataButton() {
    return (
        <button
            onClick={() => {
                addDefaultData({})
            }}
        >make default data</button>
    )
}
