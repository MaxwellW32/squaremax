import { atom } from "jotai"

export type item = {
    id: string,
    title: string,
    price: number,
    description: string,
    image: string
}

export const cartItemsGlobal = atom<{ product: item, quantity: number }[]>([])

export const burgers: item[] = [
    {
        id: "burgers2",
        title: "Beef Burger",
        price: 15.99,
        description: "Juicy beef patty with fresh toppings.",
        image: "/projects/projectThree/burgers/2.png"
    },
    {
        id: "burgers1",
        title: "Fish Burger",
        price: 10.99,
        description: "Crispy fish fillet with tartar sauce.",
        image: "/projects/projectThree/burgers/1.png"
    },
    {
        id: "burgers3",
        title: "Veggie Burger",
        price: 5.99,
        description: "Deliciously seasoned veggie patty.",
        image: "/projects/projectThree/burgers/3.png"
    },
    {
        id: "burgers4",
        title: "Dave's Triple",
        price: 10.99,
        description: "Triple the beef, triple the taste.",
        image: "/projects/projectThree/burgers/4.png"
    },
    {
        id: "burgers5",
        title: "Bacon Double Stack",
        price: 15.99,
        description: "Double patties with crispy bacon.",
        image: "/projects/projectThree/burgers/5.png"
    },
    {
        id: "burgers6",
        title: "Big Bacon Classic Double",
        price: 5.99,
        description: "Classic double with bacon delight.",
        image: "/projects/projectThree/burgers/6.png"
    },
    {
        id: "burgers7",
        title: "Big Bacon Classic",
        price: 5.99,
        description: "Classic burger with smoky bacon.",
        image: "/projects/projectThree/burgers/7.png"
    },
    {
        id: "burgers8",
        title: "Baconator",
        price: 5.99,
        description: "Loaded with bacon and beef patties.",
        image: "/projects/projectThree/burgers/8.png"
    },
    {
        id: "burgers9",
        title: "Big Bacon Classic Triple",
        price: 5.99,
        description: "Triple patties, triple bacon bliss.",
        image: "/projects/projectThree/burgers/9.png"
    },
    {
        id: "burgers10",
        title: "Dave's Double",
        price: 5.99,
        description: "Double the beef, double the flavor.",
        image: "/projects/projectThree/burgers/10.png"
    },
    {
        id: "burgers11",
        title: "Dave's Single",
        price: 5.99,
        description: "Single patty with all the fixings.",
        image: "/projects/projectThree/burgers/11.png"
    },
    {
        id: "burgers12",
        title: "Pretzel Baconator",
        price: 5.99,
        description: "Pretzel bun with bacon and beef.",
        image: "/projects/projectThree/burgers/12.png"
    },
]

export const drinks: item[] = [
    {
        id: "drinks1",
        title: "Coca-Cola",
        price: 1.99,
        description: "Classic fizzy cola drink.",
        image: "/projects/projectThree/drinks/1.png"

    },
    {
        id: "drinks2",
        title: "Diet Coke",
        price: 1.99,
        description: "Refreshing low-calorie cola.",
        image: "/projects/projectThree/drinks/2.png"

    },
    {
        id: "drinks3",
        title: "Sprite",
        price: 1.99,
        description: "Crisp lemon-lime soda.",
        image: "/projects/projectThree/drinks/3.png"

    },
    {
        id: "drinks4",
        title: "Fanta Orange",
        price: 1.99,
        description: "Tangy orange flavored soda.",
        image: "/projects/projectThree/drinks/4.png"

    },
    {
        id: "drinks5",
        title: "Dr Pepper",
        price: 1.99,
        description: "Unique blend of 23 flavors.",
        image: "/projects/projectThree/drinks/5.png"

    },
    {
        id: "drinks6",
        title: "Minute Maid Lemonade",
        price: 1.99,
        description: "Sweet and tangy lemonade.",
        image: "/projects/projectThree/drinks/6.png"

    },
    {
        id: "drinks7",
        title: "Hi-C Flashin' Fruit Punch",
        price: 1.99,
        description: "Fruity and refreshing punch.",
        image: "/projects/projectThree/drinks/7.png"

    },
    {
        id: "drinks8",
        title: "Blueberry Pomegranate Lemonade",
        price: 1.99,
        description: "Electrolyte-packed berry drink.",
        image: "/projects/projectThree/drinks/8.png"

    },
    {
        id: "drinks9",
        title: "Barq's Root Beer",
        price: 1.99,
        description: "Bold and creamy root beer.",
        image: "/projects/projectThree/drinks/9.png"

    },
    {
        id: "drinks10",
        title: "pure life Water",
        price: 1.49,
        description: "refreshing bottled water.",
        image: "/projects/projectThree/drinks/10.png"

    }
]

export const desserts: item[] = [
    {
        id: "desserts2",
        title: "Frosty Vanilla",
        price: 2.49,
        description: "Smooth vanilla frozen delight.",
        image: "/projects/projectThree/desserts/2.png"

    },
    {
        id: "desserts1",
        title: "Hersheys Pie",
        price: 2.49,
        description: "Creamy chocolate pie.",
        image: "/projects/projectThree/desserts/1.png"

    },
    {
        id: "desserts3",
        title: "Chocolate Chunk Cookie",
        price: 1.49,
        description: "Loaded with chocolate chunks.",
        image: "/projects/projectThree/desserts/3.png"

    },
    {
        id: "desserts4",
        title: "Sugar Cookie",
        price: 1.49,
        description: "Soft and sweet classic cookie.",
        image: "/projects/projectThree/desserts/4.png"

    },
    {
        id: "desserts5",
        title: "Oatmeal Bar",
        price: 1.49,
        description: "Chewy and wholesome oatmeal bar.",
        image: "/projects/projectThree/desserts/5.png"

    },
    {
        id: "desserts6",
        title: "Cinnabon pull-apart",
        price: 2.49,
        description: "tasty, crispy and ready to eat",
        image: "/projects/projectThree/desserts/6.png"

    },
    {
        id: "desserts7",
        title: "Caramel drizzle",
        price: 2.99,
        description: "sweet and salty caramel",
        image: "/projects/projectThree/desserts/7.png"

    },
]

export const sides: item[] = [
    {
        id: "sides1",
        title: "Loaded Fries",
        price: 2.49,
        description: "Crispy and golden fries.",
        image: "/projects/projectThree/sides/1.png"

    },
    {
        id: "sides2",
        title: "Baked Potato",
        price: 2.99,
        description: "Fluffy baked potato.",
        image: "/projects/projectThree/sides/2.png"

    },
    {
        id: "sides3",
        title: "Chili Potato",
        price: 3.49,
        description: "Hearty and spicy beef chili potato.",
        image: "/projects/projectThree/sides/3.png"

    },
    {
        id: "sides4",
        title: "Parmesan Caesar Salad",
        price: 2.49,
        description: "Fresh and crisp garden salad.",
        image: "/projects/projectThree/sides/4.png"

    },
    {
        id: "sides5",
        title: "cobb Salad",
        price: 3.49,
        description: "Tasty cobb salad.",
        image: "/projects/projectThree/sides/5.png"

    },
    {
        id: "sides7",
        title: "BBQ Sauce",
        price: 0.49,
        description: "Sweet and smoky BBQ sauce.",
        image: "/projects/projectThree/sides/6.png"

    },
    {
        id: "sides8",
        title: "Sweet & Sour Sauce",
        price: 0.49,
        description: "Tangy and sweet dipping sauce.",
        image: "/projects/projectThree/sides/7.png"

    },
    {
        id: "sides9",
        title: "Ranch Sauce",
        price: 0.49,
        description: "Creamy and savory ranch dip.",
        image: "/projects/projectThree/sides/8.png"

    },
    {
        id: "sides10",
        title: "Ketchup",
        price: 0.49,
        description: "Rich tomato ketchup.",
        image: "/projects/projectThree/sides/9.png"

    },
    {
        id: "sides11",
        title: "Honey Mustard Sauce",
        price: 0.49,
        description: "Sweet and tangy mustard dip.",
        image: "/projects/projectThree/sides/10.png"

    },
    {
        id: "desserts6",
        title: "Buffalo wild wings",
        price: 3.99,
        description: "get your wings",
        image: "/projects/projectThree/sides/11.png"

    },

]
