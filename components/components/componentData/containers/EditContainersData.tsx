"use client"
import { componentDataType, containersType, pagesToComponent } from '@/types'
import React from 'react'

export default function EditContainersData({ data, activePagesToComponent, handlePropsChange }: { data: containersType, activePagesToComponent: pagesToComponent, handlePropsChange: (newPropsObj: componentDataType, seenComponentInPage: pagesToComponent) => void }) {

    return (
        <form>
            <p>Seeing container to edit</p>

            <p>category {data.category}</p>

            <div>{JSON.stringify(data.children)}</div>
        </form>
    )
}
