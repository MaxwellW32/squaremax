"use client"
import React, { useState } from "react"
import toast from "react-hot-toast"
import { getTenantCustomers, importCustomersFromTenant } from "@/serverFunctions/handleCustomers"

//============================================================
// Customers tab: everyone who created an account on THIS site.
// Each business owns its own list; the import tool copies a
// list from another site the same owner runs.
//============================================================

export type CustomerRow = {
    id: string
    email: string
    name: string
    phone: string
    notifyEmail: boolean
    notifyWhatsapp: boolean
    createdAt: Date | string
}

export default function CustomersTab(props: {
    tenantId: string
    initialCustomers: CustomerRow[]
    otherTenants: { id: string; businessName: string }[]
}) {
    const [customers, customersSet] = useState<CustomerRow[]>(props.initialCustomers)
    const [importFrom, importFromSet] = useState("")
    const [busy, busySet] = useState(false)

    const importList = async () => {
        if (busy || importFrom === "") return
        busySet(true)
        try {
            const result = await importCustomersFromTenant(props.tenantId, importFrom)
            toast.success(`Imported ${result.imported} customer${result.imported === 1 ? "" : "s"}${result.skipped > 0 ? ` (${result.skipped} already here)` : ""}`)
            customersSet(await getTenantCustomers(props.tenantId))
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "import failed")
        } finally {
            busySet(false)
        }
    }

    return (
        <div className="grid max-w-3xl gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-mist">
                    <strong className="text-ink">{customers.length}</strong> customer{customers.length === 1 ? "" : "s"} signed up on this site.
                    Accounts are unique to each business — customers on one of your sites never see another.
                </p>

                {props.otherTenants.length > 0 && (
                    <div className="flex items-center gap-2">
                        <select className="rounded-md border border-line bg-surface px-3 py-2 text-sm" value={importFrom} onChange={e => importFromSet(e.target.value)}>
                            <option value="">Import from…</option>
                            {props.otherTenants.map(tenant => (
                                <option key={tenant.id} value={tenant.id}>{tenant.businessName}</option>
                            ))}
                        </select>
                        <button type="button" disabled={busy || importFrom === ""} onClick={importList}
                            className="rounded-md border border-ink px-3 py-2 text-sm font-semibold hover:bg-ink hover:text-white disabled:opacity-50">
                            Import
                        </button>
                    </div>
                )}
            </div>

            <div className="grid gap-2">
                {customers.length === 0 && (
                    <p className="rounded-lg border border-dashed border-line px-4 py-6 text-center text-sm text-mist">
                        No customer accounts yet. Customers can sign up from the <span className="font-mono">/account</span> page on your site.
                    </p>
                )}
                {customers.map(customer => (
                    <div key={customer.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface p-3 text-sm">
                        <div className="grid grow gap-0.5">
                            <p className="font-semibold">{customer.name !== "" ? customer.name : customer.email}</p>
                            <p className="text-xs text-mist">
                                {customer.email}{customer.phone !== "" ? ` · ${customer.phone}` : ""} · joined {new Date(customer.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                            {customer.notifyEmail && <span className="rounded-full bg-line px-2 py-0.5 font-semibold text-mist">email ok</span>}
                            {customer.notifyWhatsapp && customer.phone !== "" && (
                                <a href={`https://wa.me/${customer.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                                    className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-800 hover:underline">
                                    WhatsApp ↗
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
