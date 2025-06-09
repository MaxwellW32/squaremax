"use client"
import React from 'react'
import Moment from 'react-moment'

export default function ShowDate({ date }: { date: Date }) {
    return (
        <Moment from={new Date}>{date}</Moment>
    )
}
