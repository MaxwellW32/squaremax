"use client"
import { addDefaultData } from '@/serverFunctions/handleDefaultData'
import React from 'react'
import { toast } from 'react-hot-toast'

export default function AddDefaultDataButton() {
    return (
        <button
            onClick={async () => {
                try {
                    await addDefaultData({
                        project: true,
                        template: true,
                    })

                    toast.success("made default data")

                } catch (error) {
                    toast.error("error creating default data")
                    console.log(`$error creating default data`, error);
                }
            }}
        >make default data</button>
    )
}
