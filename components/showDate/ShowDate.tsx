"use client"
import React from 'react'
import moment from 'moment'

export default function ShowDate({ date }: { date: Date }) {
    return (
        <>
            {moment(date, "YYYYMMDD").fromNow()}
        </>
    )
}