"use client"
import React from 'react'
import { timeAgo } from '@/utility/dates'

export default function ShowDate({ date }: { date: Date }) {
    return (
        <span>{timeAgo(date)}</span>
    )
}
