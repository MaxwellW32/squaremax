"use client"
import { template } from '@/types';
import React from 'react'
import { toast } from 'react-hot-toast';

export default function CopyTemplateIdButton({ template }: { template: template }) {

    return (
        <button className="tag toolTip" data-tooltip="copy template id" style={{ justifySelf: "flex-end" }}
            onClick={() => {
                navigator.clipboard.writeText(template.id);
                toast.success("id copied")
            }}
        >{template.id}</button>
    )
}
