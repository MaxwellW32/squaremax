export type serviceName = "Website Development" | "Mobile App Development" | "E-commerce Solutions" | "Cloud Solutions Integration" | "Custom Software Development" | "SEO and Marketing" | "Managed Hosting";

export type service = {
    image: string,
    name: serviceName,
    shortSummary: string,
    slug: string,
    icon: JSX.Element,
    keyFeatures: string[],
    technologyUsed: string[],
    process: serviceProcess[],
    additionalText: JSX.Element,
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
        slug: "websiteDevelopment",
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
        ],
        additionalText: (
            <>
                <p>Our Next.js web development service combines cutting-edge technology with strategic design to create web applications that exceed client expectations. We leverage the power of Next.js, to build robust, scalable, and SEO-friendly web apps that perform exceptionally well across devices.</p>

                <p>From custom features to complex functionalities, we ensure every aspect of your web app aligns with your business objectives.</p>
            </>
        )
    },
    {
        image: "/services/phone.png",
        name: "Mobile App Development",
        shortSummary: "We designing and developing iOS and Android apps for a seamless user experiences.",
        slug: "mobileAppDevelopment",
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
        ],
        additionalText: (
            <>
                <p>Our Mobile App Development service with React Native offers cutting-edge solutions for businesses seeking to establish a strong presence on iOS and Android platforms. Leveraging the versatility of React Native, we craft seamless and intuitive mobile apps that provide exceptional user experiences across devices.</p>

                <p>From concept to deployment, we tailor each app to meet your unique requirements, ensuring that every feature aligns with your business goals. Whether you need a native app or cross-platform solution, we deliver high-quality mobile experiences that captivate your audience and drive success.</p>
            </>
        )
    },
    {
        image: "/services/ecommerce.png",
        name: "E-commerce Solutions",
        shortSummary: "We build robust e-commerce platforms for businesses to sell products or services online.",
        slug: "eCommerceSolutions",
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
        ],
        additionalText: (
            <>
                <p>Our E-commerce Solutions service is designed to help businesses establish and grow their online presence. We specialize in building robust e-commerce platforms that enable businesses to sell products or services online with ease.</p>

                <p>We focus on integrating secure payment gateways, efficient order management systems, and personalized shopping experiences to ensure a seamless and secure online shopping environment for your customers.</p>
            </>
        )
    },
    {
        image: "/services/customdev.png",
        name: "Custom Software Development",
        shortSummary: "We develop tailored software solutions to automate processes, improve efficiency, and address specific business challenges, from CRM systems to inventory management tools.",
        slug: "customSoftwareDevelopment",
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
        ],
        additionalText: (
            <>
                <p>Our Custom Software Development service empowers businesses by providing tailored solutions to automate processes, boost efficiency, and overcome specific challenges. From CRM systems to inventory management tools, we develop software that aligns perfectly with your unique requirements and business objectives.</p>

                <p>Our expertise lies in understanding your needs and translating them into intuitive and scalable software solutions that drive growth and success.</p>
            </>
        )
    },
    {
        image: "/services/seo.jpg",
        name: "SEO and Marketing",
        shortSummary: "Our SEO specialists optimize your website to work better with Google, enhancing visibility and driving traffic. We handle everything from registering your business with Google Analytics to Google analytics and growth strategies.",
        slug: "seoAndMarketing",
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
        ],
        additionalText: (
            <>
                <p>Our SEO and Marketing services boost your business&apos;s online visibility and drive targeted traffic. Our specialists use comprehensive strategies to optimize your site, ensuring it ranks higher on search engines. We handle everything from keyword research and content optimization to link building and performance tracking, helping your business grow organically.</p>

                <p>We create compelling Ad campaigns tailored to your business needs, ensuring your ads capture attention and perform well on platforms like Google Ads and Facebook Ads.</p>

                <p>Our expertise attracts more visitors and converts them into loyal customers. We provide detailed analytics and insights, tracking your website&apos;s performance and progress. Our data-driven strategies and expert guidance lead to measurable improvements, helping you achieve your marketing goals with confidence.</p>

                <p>Let us bridge the gap between your business and your audience with innovative ad campaigns and meticulous performance tracking. Partner with us to see your business thrive in the digital landscape.</p>
            </>
        )
    },
    {
        image: "/services/hosting.jpg",
        name: "Managed Hosting",
        shortSummary: "With managed hosting we can handle your domain, business email, contact forms, and hosting to make setup a breeze. Or provide support to host your website with your preferred providers.",
        slug: "managedHosting",
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
        ],
        additionalText: (
            <>
                <p> Our Managed Hosting service provides a hassle-free solution for your hosting needs. We handle everything from domain management and business email setup to secure hosting environments and reliable contact form integrations.</p>

                <p>With 24/7 monitoring and support, we ensure your website is always up and running smoothly, giving you peace of mind and allowing you to focus on your business.</p>
            </>
        )
    },
];
