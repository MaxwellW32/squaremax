import { SiteContent } from "./content"
import { SiteConfig } from "./config"

//every section variant receives the same contract: the tenant's full
//content + presentation config + slug (for form actions and links).
//variants read only the slices they need.
export type SectionProps = {
    content: SiteContent
    config: SiteConfig
    slug: string
    //true inside the onboarding/dashboard preview: interactive islands
    //(booking, contact form) render as static placeholders
    preview?: boolean
}
