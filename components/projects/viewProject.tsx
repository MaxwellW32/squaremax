"use client"
import { project } from '@/types'
import React from 'react'

export default function ViewProject({ seenProject }: { seenProject: project }) {
    return (
        <div>
            <p>Viewing {seenProject.name}</p>
        </div>
    )
}
