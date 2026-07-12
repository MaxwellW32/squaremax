const divisions: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
    { amount: 60, unit: "seconds" },
    { amount: 60, unit: "minutes" },
    { amount: 24, unit: "hours" },
    { amount: 7, unit: "days" },
    { amount: 4.34524, unit: "weeks" },
    { amount: 12, unit: "months" },
    { amount: Number.POSITIVE_INFINITY, unit: "years" },
]

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

//"3 days ago" / "in 3 days" style relative formatting
export function timeAgo(date: Date | string): string {
    let duration = (new Date(date).getTime() - Date.now()) / 1000

    for (const division of divisions) {
        if (Math.abs(duration) < division.amount) {
            return rtf.format(Math.round(duration), division.unit)
        }

        duration /= division.amount
    }

    return rtf.format(Math.round(duration), "years")
}

export function formatLongDate(date: Date | string): string {
    return new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}
