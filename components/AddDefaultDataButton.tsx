"use client"
import { addDefaultData } from '@/serverFunctions/handleDefaultData'
import React from 'react'
import { toast } from 'react-hot-toast'

export default function AddDefaultDataButton() {
    return (
        <button
            onClick={() => {
                try {
                    addDefaultData({
                        project: true,
                        template: true,
                    })

                    toast.success("made default data")
                } catch (error) {

                }
            }}
        >make default data</button>
    )
}
