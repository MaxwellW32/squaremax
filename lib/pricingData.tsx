export const pricingFeatures = [
    {
        name: "pageAmt",
        content: "web design"
    },
    {
        name: "hostingTime",
        content: "web hosting"
    },
    {
        name: "domainName",
        content: "domain setup"
    },
    {
        name: "cms",
        content: "content management"
    },
    {
        name: "seo",
        content: "seo optimization"
    },
    {
        name: "analytics",
        content: "analytics"
    },
    {
        name: "socialLinks",
        content: "social link creation"
    },
    {
        name: "graphicDesign",
        content: "Graphic creation"
    },
    {
        name: "googleBusiness",
        content: "google business suite"
    },
    {
        name: "businessStrategy",
        content: "custom business strategy"
    },
    {
        name: "authentication",
        content: "Role based authentication"
    },
    {
        name: "revisions",
        content: "revisions"
    },
    {
        name: "techSupport",
        content: "24/7 support"
    },
    {
        name: "databaseCreation",
        content: "database creation"
    },
    {
        name: "apiCreation",
        content: "custom api creation"
    },
] as const

export type PricingFeature = (typeof pricingFeatures[number])

export type PricingFeatureKeys = PricingFeature['name'];

export type pricingTable = {
    planName: string,
    shortDescription: string,
    pricing: number,
    managedHostingPrice: number,
    marketingPrice: number,
    features: { id: PricingFeatureKeys, modifier?: string }[]
}

export const pricingTables: pricingTable[] = [
    {
        planName: "basic",
        shortDescription: "Kickstart your online presence with a streamlined Landing Page, perfect for capturing leads and showcasing your brand",
        pricing: 150,
        managedHostingPrice: 25,
        features: [{ id: "pageAmt", modifier: "1 page" }, { id: "hostingTime", modifier: "1 year" }, { id: "domainName" }, { id: "cms" }, { id: "socialLinks" }, { id: "seo" }, { id: "graphicDesign" }, { id: "analytics" }],
        marketingPrice: 100,
    },
    {
        planName: "small website",
        shortDescription: "Elevate your digital footprint and engage visitors with detailed pages about your business.",
        pricing: 400,
        features: [{ id: "pageAmt", modifier: "3 page" }, { id: "hostingTime", modifier: "1 year" }, { id: "domainName" }, { id: "cms" }, { id: "socialLinks" }, { id: "seo" }, { id: "graphicDesign" }, { id: "googleBusiness" }, { id: "businessStrategy" }, { id: "analytics" }],
        managedHostingPrice: 50,
        marketingPrice: 150,
    },
    {
        planName: "medium website",
        shortDescription: "Ideal for growing businesses, our Medium Website package delivers a robust online platform with advanced features and e-commerce capabilities",
        pricing: 800,
        features: [{ id: "pageAmt", modifier: "5 page" }, { id: "hostingTime", modifier: "2 years" }, { id: "domainName" }, { id: "cms" }, { id: "socialLinks" }, { id: "seo" }, { id: "graphicDesign" }, { id: "graphicDesign" }, { id: "businessStrategy" }, { id: "analytics" }, { id: "googleBusiness" }, { id: "techSupport" }, { id: "revisions", modifier: "3" }, { id: "authentication" }, { id: "databaseCreation" }],
        managedHostingPrice: 50,
        marketingPrice: 200,
    },
    {
        planName: "large website",
        shortDescription: "Transform your business with our Large Website package, featuring custom software solutions tailored to meet your unique needs and scale with your success.",
        pricing: 1000,
        features: [{ id: "pageAmt", modifier: "9 page" }, { id: "hostingTime", modifier: "4 years" }, { id: "domainName" }, { id: "cms" }, { id: "socialLinks" }, { id: "seo" }, { id: "graphicDesign" }, { id: "graphicDesign" }, { id: "businessStrategy" }, { id: "analytics" }, { id: "googleBusiness" }, { id: "techSupport" }, { id: "revisions", modifier: "unlimited" }, { id: "apiCreation" }, { id: "databaseCreation" }, { id: "authentication" }],
        managedHostingPrice: 70,
        marketingPrice: 400,
    },
]

