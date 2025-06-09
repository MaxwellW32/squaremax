export type serviceName = "Website Development" | "Mobile App Development" | "E-commerce Solutions" | "Cloud Solutions Integration" | "Custom Software Development" | "SEO and Marketing" | "Managed Hosting";

export type service = {
    image: string,
    name: serviceName,
    shortSummary: string,
    link: string,
    icon: JSX.Element,
    keyFeatures: string[],
    technologyUsed: string[],
    process: serviceProcess[]
}

export type serviceProcess = {
    stepName: string,
    step: string,
    icon: JSX.Element
}

export const servicesData: service[] = [
    {
        image: "/services/web.png",
        name: "Website Development",
        shortSummary: "We Craft custom high performance websites tailored to the unique needs and branding of each client",
        link: "/services/websiteDevelopment",
        icon: <span style={{ fontSize: "var(--iconSizeL)" }} className="material-symbols-outlined">computer</span>,
        keyFeatures: ["SEO-friendly architecture for improved visibility and search engine rankings", "Server-side rendering for faster loading times and enhanced user experience", "Support for dynamic content and real-time updates", "Seamless integration with APIs and third-party services", "Scalable solutions to accommodate future growth and expansion"],
        technologyUsed: ["Next.js", "React.js", "Node.js", "GraphQL", "Tailwind CSS", "Typescript", "Html / Css / Javascript"],
        process: [
            {
                stepName: "Discovery & Planning",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">query_stats</span>,
                step: "Understand client requirements and define project goals.",
            },
            {
                stepName: "Design & Prototyping",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">design_services</span>,
                step: "Create wireframes and design mockups for client approval.",
            },
            {
                stepName: "Development",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">integration_instructions</span>,
                step: "Implement features and functionality using Next.js and related technologies.",
            },
            {
                stepName: "Testing",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">check_box</span>,
                step: "Conduct comprehensive testing to identify and fix any issues.",
            },
            {
                stepName: "Deployment",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">deployed_code</span>,
                step: "Deploy the web app to production environment and ensure smooth launch.",
            },
            {
                stepName: "Maintenance & Support",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">headset_mic</span>,
                step: "Provide ongoing maintenance and support to keep the web app running smoothly.",
            }
        ]
    },
    {
        image: "/services/phone.png",
        name: "Mobile App Development",
        shortSummary: "We designing and developing iOS and Android apps for a seamless user experiences.",
        link: "/services/mobileAppDevelopment",
        icon: <span style={{ fontSize: "var(--iconSizeL)" }} className="material-symbols-outlined">smartphone</span>,
        keyFeatures: ["Cross-platform development with React Native", "Seamless user experiences for iOS and Android platforms", "Integration with native device features", "Real-time updates and push notifications", "Scalable solutions for future app expansions"],
        technologyUsed: ["React Native", "Expo", "Redux", "Firebase"],
        process: [
            {
                stepName: "Discovery & Planning",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">query_stats</span>,
                step: "Understand client requirements and define app goals.",
            },
            {
                stepName: "Design & Prototyping",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">design_services</span>,
                step: "Create UI/UX wireframes and design mockups for client approval.",
            },
            {
                stepName: "Development",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">integration_instructions</span>,
                step: "Implement features and functionality using React Native and related technologies.",
            },
            {
                stepName: "Testing",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">developer_board</span>,
                step: "Conduct comprehensive testing to ensure app functionality and performance.",
            },
            {
                stepName: "Deployment",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">deployed_code</span>,
                step: "Deploy the app to respective app stores and ensure smooth launch.",
            },
            {
                stepName: "Maintenance & Support",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">support_agent</span>,
                step: "Provide ongoing maintenance and support to keep the app up-to-date and bug-free.",
            }
        ]
    },
    {
        image: "/services/ecommerce.png",
        name: "E-commerce Solutions",
        shortSummary: "We build robust e-commerce platforms for businesses to sell products or services online.",
        link: "/services/eCommerceSolutions",
        icon: <span style={{ fontSize: "var(--iconSizeL)" }} className="material-symbols-outlined">store</span>,
        keyFeatures: ["Robust e-commerce platform development", "Integration of secure payment gateways", "Efficient order management systems", "Personalized shopping experiences", "Responsive design for mobile and desktop devices"],
        technologyUsed: ["React", "Node.js", "Express", "MongoDB", "Stripe"],
        process: [
            {
                stepName: "Requirement Gathering",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">query_stats</span>,
                step: "Understand business goals and e-commerce requirements.",
            },
            {
                stepName: "Design & Development",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">design_services</span>,
                step: "Create user-friendly designs and develop e-commerce platform.",
            },
            {
                stepName: "Integration & Testing",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">developer_board</span>,
                step: "Integrate payment gateways, test functionality, and security measures.",
            },
            {
                stepName: "Launch & Optimization",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">rocket_launch</span>,
                step: "Deploy the platform and optimize for performance and SEO.",
            },
            {
                stepName: "Maintenance & Support",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">support_agent</span>,
                step: "Provide ongoing maintenance and support to ensure smooth operation.",
            }
        ]
    },
    {
        image: "/services/customdev.png",
        name: "Custom Software Development",
        shortSummary: "We develop tailored software solutions to automate processes, improve efficiency, and address specific business challenges, from CRM systems to inventory management tools.",
        link: "/services/customSoftwareDevelopment",
        icon: <span style={{ fontSize: "var(--iconSizeL)" }} className="material-symbols-outlined">sdk</span>,
        keyFeatures: ["Tailored software solutions for specific business needs", "Automation of processes to improve efficiency", "Scalable and flexible architecture", "Intuitive user interfaces for enhanced usability", "Comprehensive support and maintenance services"],
        technologyUsed: ["JavaScript", "Python", "Java", "React", "Node.js"],
        process: [
            {
                stepName: "Requirement Analysis",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">query_stats</span>,
                step: "Gather and analyze business requirements to understand needs.",
            },
            {
                stepName: "Design & Development",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">design_services</span>,
                step: "Create customized software solutions tailored to client specifications.",
            },
            {
                stepName: "Testing & Quality Assurance",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">check_box</span>,
                step: "Thoroughly test software for functionality, performance, and security.",
            },
            {
                stepName: "Deployment & Integration",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">design_services</span>,
                step: "Deploy software and integrate with existing systems, ensuring seamless operation.",
            },
            {
                stepName: "Maintenance & Support",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">support_agent</span>,
                step: "Provide ongoing maintenance and support to optimize software performance.",
            }
        ]
    },
    {
        image: "/services/seo.jpg",
        name: "SEO and Marketing",
        shortSummary: "Our SEO specialists optimize your website to work better with Google, enhancing visibility and driving traffic. We handle everything from registering your business with Google Analytics to Google analytics and growth strategies.",
        link: "/services/seoAndMarketing",
        icon: <span style={{ fontSize: "var(--iconSizeL)" }} className="material-symbols-outlined">screen_search_desktop</span>,
        keyFeatures: [
            "Comprehensive SEO audits and strategy development",
            "On-page and off-page optimization",
            "Keyword research and content optimization",
            "Link building and backlink analysis",
            "Performance tracking and reporting with Google Analytics"
        ],
        technologyUsed: ["Google Analytics", "Google Search Console", "SEMrush", "Ahrefs", "JavaScript", "React", "Node.js"],
        process: [
            {
                stepName: "Initial Consultation",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">query_stats</span>,
                step: "Discuss client goals and current SEO standing.",
            },
            {
                stepName: "SEO Audit & Strategy",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">strategy</span>,
                step: "Conduct a thorough SEO audit and develop a tailored strategy.",
            },
            {
                stepName: "Implementation",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">integration_instructions</span>,
                step: "Execute on-page and off-page SEO strategies.",
            },
            {
                stepName: "Monitoring & Optimization",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">trending_up</span>,
                step: "Continuously monitor performance and refine SEO tactics.",
            },
            {
                stepName: "Reporting & Analysis",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">analytics</span>,
                step: "Provide regular reports and insights to track progress.",
            }
        ]
    },
    {
        image: "/services/hosting.jpg",
        name: "Managed Hosting",
        shortSummary: "With managed hosting we can handle your domain, business email, contact forms, and hosting to make setup a breeze. Or provide support to host your website with your preferred providers.",
        link: "/services/managedHosting",
        icon: <span style={{ fontSize: "var(--iconSizeL)" }} className="material-symbols-outlined">dvr</span>,
        keyFeatures: [
            "Full-service domain management",
            "Business email setup and management",
            "Reliable contact form integration",
            "Secure and scalable hosting solutions",
            "24/7 monitoring and support"
        ],
        technologyUsed: ["JavaScript", "React", "Node.js", "AWS", "Google Cloud Platform"],
        process: [
            {
                stepName: "Consultation & Setup",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">query_stats</span>,
                step: "Discuss hosting needs and set up domain and hosting services.",
            },
            {
                stepName: "Email & Contact Forms",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">mail</span>,
                step: "Configure business email and integrate contact forms.",
            },
            {
                stepName: "Hosting Configuration",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">manufacturing</span>,
                step: "Set up secure and scalable hosting environments.",
            },
            {
                stepName: "Monitoring & Maintenance",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">spa</span>,
                step: "Provide ongoing monitoring and maintenance for optimal performance.",
            },
            {
                stepName: "Support & Troubleshooting",
                icon: <span style={{ flex: "0 1 auto", fontSize: "var(--iconSizeL)", margin: "0 auto" }} className="material-symbols-outlined">support_agent</span>,
                step: "Offer 24/7 support and troubleshooting services.",
            }
        ]
    },
];
