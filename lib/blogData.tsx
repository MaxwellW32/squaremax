export type BlogDataType = {
    category: string;
    coverImage: string;
    datePosted: Date;
    title: string;
    brief: string;
    slug: string;
    component?: JSX.Element;
}

export const blogData: BlogDataType[] = [
    {
        category: "Website Development",
        coverImage: "https://cdn.pixabay.com/photo/2021/08/04/13/06/software-developer-6521720_1280.jpg",
        datePosted: new Date("2024-01-01"),
        title: "The Importance of UX Design in Website Development",
        brief: "Discover why user experience (UX) design is crucial for creating successful websites and how it impacts user engagement and conversion rates.",
        slug: "importance-of-ux-design",
        component: <div><p>In this blog post, we delve into the significance of user experience (UX) design in website development. You&apos;ll learn why a user-centric approach is essential for creating successful websites and how it influences factors such as user engagement and conversion rates.</p></div>

    },
    {
        category: "Web Design",
        coverImage: "https://cdn.pixabay.com/photo/2021/08/04/13/06/software-developer-6521720_1280.jpg",
        datePosted: new Date("2024-02-15"),
        title: "Choosing the Right Color Scheme for Your Website",
        brief: "Learn how selecting the appropriate color scheme can enhance the visual appeal and convey the right message for your website.",
        slug: "choosing-color-scheme",
        component: <div><p>This blog post explores the importance of choosing the right color scheme for your website. We discuss how colors can impact the visual appeal of your site, convey brand messaging, and influence user perception.</p></div>
    },
    {
        category: "Technology",
        coverImage: "https://cdn.pixabay.com/photo/2021/08/04/13/06/software-developer-6521720_1280.jpg",
        datePosted: new Date("2024-03-10"),
        title: "The Advantages of Responsive Web Design",
        brief: "Explore the benefits of responsive web design and why it's essential for providing an optimal user experience across various devices and screen sizes.",
        slug: "advantages-of-responsive-design",
        component: <div><p>In this blog post, we highlight the advantages of responsive web design. You&apos;ll discover why designing websites with responsiveness in mind is crucial for ensuring an optimal user experience across different devices and screen sizes.</p></div>
    },
    {
        category: "SEO",
        coverImage: "https://cdn.pixabay.com/photo/2021/08/04/13/06/software-developer-6521720_1280.jpg",
        datePosted: new Date("2024-04-20"),
        title: "Optimizing Your Website for Search Engines",
        brief: "Discover effective strategies for optimizing your website's content, structure, and performance to improve search engine rankings and visibility.",
        slug: "optimizing-for-seo",
        component: <div><p>This blog post provides insights into optimizing your website for search engines. We discuss various strategies and best practices to improve your site&apos;s visibility and rankings on search engine results pages.</p></div>

    },
    {
        category: "E-commerce",
        coverImage: "https://cdn.pixabay.com/photo/2021/08/04/13/06/software-developer-6521720_1280.jpg",
        datePosted: new Date("2024-05-05"),
        title: "Key Features to Include in Your E-commerce Website",
        brief: "Learn about essential features and functionalities to incorporate into your e-commerce website to enhance user experience and drive sales.",
        slug: "key-features-for-ecommerce",
        component: <div><p>In this blog post, we outline key features to include in your e-commerce website to improve user experience and boost sales. From intuitive navigation to secure payment options, discover how to create a successful online store.</p></div>
    }
];

