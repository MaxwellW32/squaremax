import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto"

//scrypt password hashing for tenant-site customer accounts (no extra deps).
//format: scrypt$N$salt(hex)$hash(hex) — parameters stored per hash so cost
//can be raised later without invalidating existing accounts.

const SCRYPT_COST = 16384 //N
const KEY_LENGTH = 64

export function hashPassword(password: string): string {
    const salt = randomBytes(16).toString("hex")
    const hash = scryptSync(password, salt, KEY_LENGTH, { N: SCRYPT_COST }).toString("hex")
    return `scrypt$${SCRYPT_COST}$${salt}$${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
    const parts = stored.split("$")
    if (parts.length !== 4 || parts[0] !== "scrypt") return false

    const cost = Number(parts[1])
    if (!Number.isInteger(cost) || cost < 2 || cost > 1 << 20) return false

    const expected = Buffer.from(parts[3], "hex")
    if (expected.length !== KEY_LENGTH) return false

    const actual = scryptSync(password, parts[2], KEY_LENGTH, { N: cost })
    return timingSafeEqual(actual, expected)
}
