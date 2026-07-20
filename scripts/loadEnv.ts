//imported FIRST by scripts so .env.local is loaded before any module that
//validates process.env at import time (lib/env.ts via db/index.ts)
import { config } from "dotenv"
config({ path: ".env.local" })
