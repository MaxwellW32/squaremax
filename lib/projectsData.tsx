import { serviceName } from "./servicesData"

export type categoryStyles = "traditional" | "modern" | "fun"
export type category = "restaurants"

export type projectData = {
    name: string,
    slug: string,
    image: string,
    type: "landing page" | "website",
    forCategory: category[]
    categoryStyles: categoryStyles[],
    representingService: serviceName[],
    inspiration?: string
}


export const projectsData: projectData[] = [
    {
        name: "Luminous Lens Photography",
        slug: "luminousLensPhotography",
        image: `/projects/luminousLens/luminous.jpg`,
        type: "landing page",
        forCategory: [],
        categoryStyles: ["modern"],
        representingService: ["Website Development"],
        inspiration: "https://shtheme.org/demosd/jopho/?page_id=385"
    },
    {
        name: "Folliblanc Music",
        slug: "FolliblancMusic",
        image: `/projects/folliblancMusic/titleimage.jpg`,
        type: "landing page",
        forCategory: [],
        categoryStyles: ["fun"],
        representingService: ["Website Development"],
        inspiration: "https://www.imreallyatrex.com"
    },
    {
        name: "Burger Bliss",
        slug: "burgerBliss",
        image: `/projects/projectThree/cover.jpg`,
        type: "landing page",
        forCategory: ["restaurants"],
        categoryStyles: ["modern"],
        representingService: ["Website Development"],
        inspiration: "https://themes.themegoods.com/grandrestaurantv6/demo9/"
    }
    // {
    //     name: "",
    //     slug: "",
    //     image: "",
    //     component: <></>,
    //     type: "landing page",
    //     categoryStyles: [],
    //     representingService: []
    // }
]