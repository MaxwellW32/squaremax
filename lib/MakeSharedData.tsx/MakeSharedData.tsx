import { categoryName, categoryNameSchema, linkedDataType } from "@/types";
import shuffleArray from "@/usefulFunctions/shuffleArray";

export function makeSharedData(category: categoryName): linkedDataType {
    //ensure category name is passed
    categoryNameSchema.parse(category)

    if (category === "food") {
        const newSharedData: linkedDataType = {
            siteInfo: {
                phone: "(876)123-4567",
                address: "123 Flavor Street, Culinary City, Foodland",
                websiteName: "YourRestaurant",
                websiteTitle: "YourRestaurant - Savor Every Bite",
                websiteDescription: "Discover mouth-watering dishes and exceptional dining experiences.",
                logo: "",
                opengraphLogo: "",
                email: "info@YourRestaurant.com",
                workingHours: "Mon-Sun: 10am - 10pm",
                favicon: "",
                copyrightInformation: "© 2024 yourRestaurant. All rights reserved.",
            },
            gallery: makeGallery(category, 10),
            products: [],
            services: [],
            socials: [],
            team: [],
            testimonials: [],
        }

        return newSharedData
    } else if (category === "ecommerce") {
        const newSharedData: linkedDataType = {
            siteInfo: {
                phone: "(876)123-4567",
                address: "123 Ecommerce Street, Selling City, StockLand",
                websiteName: "YourEcommerceSite",
                websiteTitle: "YourEcommerceSite - Savor Every Sale",
                websiteDescription: "Discover Sales like never before.",
                logo: "",
                opengraphLogo: "",
                email: "info@YourEcommerceSite.com",
                workingHours: "Mon-Sun: 10am - 10pm",
                favicon: "",
                copyrightInformation: "© 2024 YourEcommerceSite. All rights reserved.",
            },
            gallery: makeGallery(category, 10),
            products: [],
            services: [],
            socials: [],
            team: [],
            testimonials: [],
        }

        return newSharedData
    } else {
        throw new Error("meep")
    }
}

export const firstNames = [
    "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
    "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph",
    "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy",
    "Daniel", "Margaret", "Matthew", "Lisa", "Anthony", "Betty", "Donald",
    "Dorothy", "Mark", "Sandra", "Paul", "Ashley", "Steven", "Kimberly",
    "Andrew", "Donna", "Kenneth", "Emily", "Joshua", "Michelle", "George",
    "Carol", "Kevin", "Amanda", "Brian", "Melissa", "Edward", "Deborah", "Mathew"
];

export const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
    "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson",
    "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee",
    "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez",
    "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott",
    "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker",
    "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts", "Wedderburn"
];

type galleryType = {
    for: "gallery",
    titleWords: string[],
    images: string[],
    categoryOptions: string[],
    tagOptions: string[],
}

type productType = {
    for: "products",
    description: string,
}

type otherType = {
    for: "other",
}

type specType = galleryType | productType | otherType

type categoryStarter = {
    [key in categoryName]: {
        [key in keyof linkedDataType]: specType
    }
}
const categoryStarterObj: categoryStarter = {
    food: {
        gallery: {
            titleWords: ["Golden", "Crispy", "Spicy", "Sweet", "Savory", "Tangy", "Zesty", "Smoky", "Juicy", "Tender", "Fiery", "Aromatic", "Rustic", "Creamy", "Sizzling"],
            images: ["", "", ""],
            categoryOptions: ["Appetizers", "Main Courses", "Desserts", "Beverages", "Snacks", "Sides", "Salads", "Soups", "Breakfast", "Brunch", "Grill", "Vegan", "Gluten-Free", "Seafood", "Pasta"],
            tagOptions: ["Spicy", "Sweet", "Savory", "Crispy", "Healthy", "Comfort Food", "Quick Meal", "Slow Cooked", "Gourmet", "Kids Favorite", "Party Dish", "Seasonal", "Organic", "Fresh", "Homemade"],
            for: "gallery"
        },
        products: {
            description: "hell yeah",
            for: "products"
        },
        services: {
            for: "other",
        },
        siteInfo: {
            for: "other",
        },
        socials: {
            for: "other",
        },
        team: {
            for: "other",
        },
        testimonials: {
            for: "other",
        },
    },
    ecommerce: {
        gallery: {
            titleWords: ["Exclusive", "Premium", "Affordable", "Handcrafted", "Limited"],
            images: ["", "", ""],
            categoryOptions: ["Electronics", "Fashion", "Home & Living", "Beauty", "Sports"],
            tagOptions: ["Best Seller", "New Arrival", "On Sale", "Eco-Friendly", "Handmade"],
            for: "gallery"
        },

        products: {
            description: "hell yeah",
            for: "products"
        },
        services: {
            for: "other",
        },
        siteInfo: {
            for: "other",
        },
        socials: {
            for: "other",
        },
        team: {
            for: "other",
        },
        testimonials: {
            for: "other",
        },
    }
}

export function makeGallery(category: categoryName, amount = 1): linkedDataType["gallery"] {
    const newGallery: linkedDataType["gallery"] = []
    const seenStarterObj = categoryStarterObj[category]["gallery"]
    if (seenStarterObj.for !== "gallery") return newGallery

    for (let index = 0; index < amount; index++) {
        const titleWordChosen = shuffleArray(seenStarterObj.titleWords)[Math.floor(Math.random() * seenStarterObj.titleWords.length)]

        const newGalleryObj: linkedDataType["gallery"][number] = {
            title: `${titleWordChosen}`,
            description: `this ${titleWordChosen} is a long description`,
            image: seenStarterObj.images[seenStarterObj.images.length % index],
            categories: shuffleArray(seenStarterObj.categoryOptions).slice(0, (Math.floor(Math.random() * seenStarterObj.categoryOptions.length) + 1)),
            tags: shuffleArray(seenStarterObj.tagOptions).slice(0, (Math.floor(Math.random() * seenStarterObj.tagOptions.length) + 1)),
            featured: amount === 1 ? false : Math.random() > 0.7 ? true : false, //return false when client makes requests only one
            date: `${(new Date(Date.now() - Math.floor(Math.random() * 604_800_000))).toLocaleDateString()}`, //any date from now - till a week ago
            author: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        }

        newGallery.push(newGalleryObj)
    }

    return newGallery
}