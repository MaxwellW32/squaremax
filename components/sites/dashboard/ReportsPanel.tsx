"use client"
import React, { useState } from "react"
import toast from "react-hot-toast"
import { addExpense, deleteExpense, getReport } from "@/serverFunctions/handleInventory"
import { businessDateISO } from "@/lib/sites/bookingLogic"

//============================================================
// Reports & expenses: pick a range, see what an accountant asks
// for (revenue, tax collected, COGS, gross/net profit, payment
// breakdown), download CSVs, and keep the expenses ledger.
//============================================================

type Report = Awaited<ReturnType<typeof getReport>>

const input = "rounded-md border border-line bg-surface px-3 py-2 text-sm font-normal"
const money = (cents: number) => `$${(cents / 100).toFixed(2)}`

//calendar dates in Jamaica time — a 10pm entry belongs to today, not to
//tomorrow's UTC date
function todayISO(): string {
    return businessDateISO(new Date())
}

function monthStartISO(): string {
    return `${todayISO().slice(0, 7)}-01`
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
    const escapeCell = (cell: string | number) => {
        const text = String(cell)
        return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
    }
    const csv = rows.map(row => row.map(escapeCell).join(",")).join("\n")
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
}

export default function ReportsPanel({ tenantId }: { tenantId: string }) {
    const [fromISO, fromISOSet] = useState(monthStartISO())
    const [toISO, toISOSet] = useState(todayISO())
    const [report, reportSet] = useState<Report | null>(null)
    const [busy, busySet] = useState(false)

    //expense form
    const [expenseLabel, expenseLabelSet] = useState("")
    const [expenseCategory, expenseCategorySet] = useState("general")
    const [expenseAmount, expenseAmountSet] = useState("")
    const [expenseDate, expenseDateSet] = useState(todayISO())

    const run = async (work: () => Promise<unknown>, success?: string) => {
        if (busy) return
        busySet(true)
        try {
            await work()
            if (success !== undefined) toast.success(success)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "something went wrong")
        } finally {
            busySet(false)
        }
    }

    const loadReport = () => run(async () => {
        reportSet(await getReport(tenantId, { fromISO, toISO }))
    })

    const exportSalesCsv = () => {
        if (report === null) return
        downloadCsv(`sales-${fromISO}-to-${toISO}.csv`, [
            ["Date", "Receipt", "Items", "Payment", "Status", "Subtotal", "Discount", "Tax", "Total", "Customer", "Note"],
            ...report.sales.map(sale => [
                new Date(sale.createdAt).toISOString().slice(0, 16).replace("T", " "),
                sale.id,
                sale.items.map(item => `${item.qty}x ${item.name}`).join("; "),
                sale.paymentMethod,
                sale.status,
                (sale.subtotalCents / 100).toFixed(2),
                (sale.discountCents / 100).toFixed(2),
                (sale.taxCents / 100).toFixed(2),
                (sale.totalCents / 100).toFixed(2),
                sale.customerName,
                sale.note,
            ]),
        ])
    }

    const exportExpensesCsv = () => {
        if (report === null) return
        downloadCsv(`expenses-${fromISO}-to-${toISO}.csv`, [
            ["Date", "Label", "Category", "Amount", "Note"],
            ...report.expenses.map(expense => [
                new Date(expense.incurredAt).toISOString().slice(0, 10),
                expense.label,
                expense.category,
                (expense.amountCents / 100).toFixed(2),
                expense.note,
            ]),
        ])
    }

    const submitExpense = () => run(async () => {
        const amountCents = Math.round(Number(expenseAmount) * 100)
        if (expenseLabel.trim() === "") throw new Error("describe the expense")
        if (!Number.isFinite(amountCents) || amountCents <= 0) throw new Error("amount must be a number")
        await addExpense(tenantId, { label: expenseLabel.trim(), category: expenseCategory, amountCents, incurredAtISO: expenseDate, note: "" })
        expenseLabelSet("")
        expenseAmountSet("")
        if (report !== null) reportSet(await getReport(tenantId, { fromISO, toISO }))
    }, "Expense recorded")

    return (
        <div className="grid gap-4 rounded-xl border border-line bg-surface p-4">
            <div className="flex flex-wrap items-end gap-2">
                <p className="mr-auto font-display font-bold">Reports & taxes</p>
                <label className="grid gap-1 text-xs font-semibold">From
                    <input className={input} type="date" value={fromISO} onChange={e => fromISOSet(e.target.value)} />
                </label>
                <label className="grid gap-1 text-xs font-semibold">To
                    <input className={input} type="date" value={toISO} onChange={e => toISOSet(e.target.value)} />
                </label>
                <button type="button" disabled={busy} onClick={loadReport}
                    className="rounded-lg bg-cobalt px-4 py-2 text-sm font-display font-bold text-white hover:bg-ink disabled:opacity-50">
                    {busy ? "Crunching…" : "Run report"}
                </button>
            </div>

            {report !== null && (
                <>
                    <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                        {[
                            { label: "Takings (incl. tax)", value: money(report.revenueCents) },
                            { label: "Tax collected", value: money(report.taxCents) },
                            { label: "Net sales", value: money(report.netSalesCents) },
                            { label: "Cost of goods", value: money(report.cogsCents) },
                            { label: "Expenses", value: money(report.expensesCents) },
                            { label: "Net profit", value: money(report.netProfitCents) },
                        ].map(stat => (
                            <div key={stat.label} className="rounded-lg border border-line bg-paper p-3">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-mist">{stat.label}</p>
                                <p className="font-display text-lg font-bold">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    <p className="text-xs text-mist">
                        {report.receipts} sale{report.receipts === 1 ? "" : "s"}{report.refunds > 0 ? ` · ${report.refunds} refunded (excluded from totals)` : ""}{report.discountCents > 0 ? ` · ${money(report.discountCents)} in discounts` : ""}.
                        Tax collected is what you set aside for filing; net profit = net sales − cost of goods − expenses.
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid content-start gap-1.5 text-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-mist">Top products</p>
                            {report.byProduct.length === 0 && <p className="text-mist">No sales in this range.</p>}
                            {report.byProduct.slice(0, 6).map(product => (
                                <p key={product.name} className="flex justify-between gap-3">
                                    <span>{product.qty}× {product.name}</span><span className="font-semibold">{money(product.revenueCents)}</span>
                                </p>
                            ))}
                        </div>
                        <div className="grid content-start gap-1.5 text-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-mist">By payment method</p>
                            {report.byPayment.map(payment => (
                                <p key={payment.method} className="flex justify-between gap-3 capitalize">
                                    <span>{payment.method} ({payment.count})</span><span className="font-semibold">{money(payment.totalCents)}</span>
                                </p>
                            ))}
                            {report.byExpenseCategory.length > 0 && (
                                <>
                                    <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-mist">Expenses by category</p>
                                    {report.byExpenseCategory.map(expenseCategoryRow => (
                                        <p key={expenseCategoryRow.category} className="flex justify-between gap-3 capitalize">
                                            <span>{expenseCategoryRow.category}</span><span className="font-semibold">{money(expenseCategoryRow.totalCents)}</span>
                                        </p>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={exportSalesCsv} className="rounded-md border border-ink px-3 py-1.5 text-xs font-semibold hover:bg-ink hover:text-white">
                            ⬇ Sales CSV (for your accountant)
                        </button>
                        <button type="button" onClick={exportExpensesCsv} className="rounded-md border border-ink px-3 py-1.5 text-xs font-semibold hover:bg-ink hover:text-white">
                            ⬇ Expenses CSV
                        </button>
                    </div>

                    {/* expenses ledger inside the report range */}
                    <div className="grid gap-2 border-t border-line pt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-mist">Expenses in range</p>
                        {report.expenses.length === 0 && <p className="text-sm text-mist">None recorded.</p>}
                        {report.expenses.map(expense => (
                            <div key={expense.id} className="flex items-center gap-3 text-sm">
                                <span className="text-xs text-mist">{new Date(expense.incurredAt).toISOString().slice(0, 10)}</span>
                                <span className="grow">{expense.label} <span className="text-xs text-mist">({expense.category})</span></span>
                                <span className="font-semibold">{money(expense.amountCents)}</span>
                                <button type="button" disabled={busy} aria-label="Delete expense" className="text-mist hover:text-brand"
                                    onClick={() => run(async () => {
                                        await deleteExpense(tenantId, expense.id)
                                        reportSet(await getReport(tenantId, { fromISO, toISO }))
                                    }, "Deleted")}>×</button>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* record an expense */}
            <div className="grid gap-2 border-t border-line pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-mist">Record an expense</p>
                <div className="flex flex-wrap items-center gap-2">
                    <input className={`${input} grow`} placeholder="What was it? (rent, supplies…)" value={expenseLabel} onChange={e => expenseLabelSet(e.target.value)} />
                    <select className={input} value={expenseCategory} onChange={e => expenseCategorySet(e.target.value)}>
                        {["general", "rent", "supplies", "stock purchase", "utilities", "wages", "marketing", "transport", "fees"].map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                    <input className={`${input} w-28`} type="number" min={0} step="0.01" placeholder="$0.00" value={expenseAmount} onChange={e => expenseAmountSet(e.target.value)} />
                    <input className={input} type="date" value={expenseDate} onChange={e => expenseDateSet(e.target.value)} />
                    <button type="button" disabled={busy} onClick={submitExpense}
                        className="rounded-md border border-ink px-3 py-2 text-xs font-semibold hover:bg-ink hover:text-white disabled:opacity-50">
                        Add
                    </button>
                </div>
            </div>
        </div>
    )
}
