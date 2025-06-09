import Image from "next/image"
import styles from "./page.module.css"
import Nav from "./projectComponents/nav/Nav"
import ItemPicker from "./projectComponents/itemPicker/ItemPicker"
import { burgers, desserts, drinks, sides } from "./lib/products"
import Button1 from "./projectComponents/button1/Button1"
import Footer from "./projectComponents/footer/Footer"

//name Burger Bliss

export default function Page() {

    return (
        <main className={`${styles.main}`}>
            <Nav />

            <div className={styles.topCont}>
                <Image alt="burger" src={"/projects/projectThree/burger.png"} fill={true} style={{ objectFit: "cover", }} sizes="100vw" priority={true} />

                <h1 style={{ position: "relative", fontSize: "var(--extraLargeFontSize)", maxWidth: "10ch", textAlign: "center", lineHeight: "1.5ch" }}>Savor the Bliss</h1>
            </div>

            <section>
                <div style={{ display: "flex", flexWrap: "wrap", columnGap: "1rem", rowGap: "3rem", justifyContent: "center" }}>
                    <div style={{ flex: "1 1 auto", width: "min(350px, 100%)" }}>
                        <h1 style={{ borderBlock: "2px solid var(--color2)", padding: "1rem", textAlign: "center" }}>Burgers</h1>

                        <ItemPicker items={burgers} />
                    </div>

                    <div style={{ flex: "1 1 auto", width: "min(350px, 100%)" }}>
                        <h1 style={{ borderBlock: "2px solid var(--color2)", padding: "1rem", textAlign: "center" }}>Drinks</h1>

                        <ItemPicker items={drinks} />
                    </div>

                    <div style={{ flex: "1 1 auto", width: "min(350px, 100%)" }}>
                        <h1 style={{ borderBlock: "2px solid var(--color2)", padding: "1rem", textAlign: "center" }}>Desserts</h1>

                        <ItemPicker items={desserts} />
                    </div>

                    <div style={{ flex: "1 1 auto", width: "min(350px, 100%)" }}>
                        <h1 style={{ borderBlock: "2px solid var(--color2)", padding: "1rem", textAlign: "center" }}>Sides</h1>

                        <ItemPicker items={sides} horizantal={true} seekNumber={4} sizePre={350} />
                    </div>
                </div>
            </section>

            <h3 className={styles.linedText} style={{ margin: "2rem 1rem" }}>HAVE IT YOUR WAY</h3>

            <section>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 266px", minHeight: "300px", position: "relative", }}>
                        <Image alt="food" src={"/projects/projectThree/food.jpg"} fill={true} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" style={{ objectFit: "cover" }} />
                    </div>

                    <div style={{ flex: "2 1 532px", display: "flex", flexWrap: "wrap", color: "#000" }}>
                        <div style={{ flex: "1 1 266px", display: "flex", flexDirection: "column", backgroundColor: "#fff", padding: "2rem", alignContent: "flex-start", }}>
                            <h2 style={{ justifySelf: "flex-start" }}>Our Delicious</h2>
                            <h1 style={{ color: "#000" }}>Offerings</h1>
                            <p style={{ maxWidth: "30ch", lineHeight: "1.7em", flex: 1 }}>Welcome to Burger Bliss, where every bite is a journey to flavor heaven. Our menu is crafted to delight your taste buds with a variety of gourmet burgers, delectable desserts, and refreshing drinks. Whether you&apos;re in the mood for a classic burger or something sweet to finish off your meal, we&apos;ve got you covered. Dive in and explore the delicious offerings that make Burger Bliss your go-to spot for mouthwatering meals.</p>

                            <Button1 text='view menus' link='' style={{ marginTop: "2rem", marginRight: "auto" }} />
                        </div>

                        <div style={{ flex: "1 1 266px", display: "flex", flexDirection: "column", backgroundColor: "var(--gray2)", padding: "2rem", alignContent: "flex-start" }}>
                            <h2 style={{ justifySelf: "flex-start" }}>Enjoy at Home</h2>
                            <h1 style={{ color: "#000", }}>Delivery</h1>
                            <p style={{ maxWidth: "30ch", lineHeight: "1.7em", flex: 1 }}>Craving your favorite burger but can&apos;t make it to us? No worries! With our convenient delivery service, you can enjoy the taste of Burger Bliss from the comfort of your home. Order now and have our scrumptious burgers, sweet treats, and refreshing drinks delivered straight to your door.</p>

                            <Button1 text='order online' link='' style={{ marginTop: "2rem", backgroundColor: "#000", marginRight: "auto" }} />
                        </div>
                    </div>
                </div>
            </section>

            <section style={{ padding: "2rem 0 0 0" }}>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 350px", minHeight: "300px", position: "relative", }}>
                        <Image alt="food" src={"/projects/projectThree/food2.jpg"} fill={true} sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: "cover" }} />
                    </div>

                    <div style={{ flex: "1 1 350px", display: "grid", gap: "1rem", padding: "4rem 2rem", backgroundColor: "#fff", color: "#000", textAlign: "center", justifyItems: "center" }}>
                        <h3 style={{ color: "#000", justifySelf: "stretch", "--lineColor": "#000" } as React.CSSProperties} className={styles.linedText}>PRESENT</h3>

                        <div style={{ display: "grid" }}>
                            <h1 style={{ color: "#000" }}>BLISSFUL</h1>
                            <h1 style={{ color: "#000" }}>CLASSIC</h1>
                            <p style={{ color: "var(--color1)", fontSize: "var(--fontSizeL)", fontWeight: "500", position: 'relative', top: "-.6em" }}>Burger</p>
                        </div>

                        <p style={{ fontWeight: "500", textTransform: "uppercase" }}>A FAN FAVORITE</p>

                        <p style={{ maxWidth: "40ch", lineHeight: "1.7em" }}>This burger features a juicy, 100% beef patty grilled to perfection and topped with crisp lettuce, ripe tomatoes, and crunchy pickles. Melted cheddar cheese and our signature Bliss Sauce add the perfect finishing touches. Served on a toasted brioche bun, this classic is sure to satisfy your burger cravings.</p>

                        <Button1 text='view menus' link='' style={{ marginTop: "2rem" }} />
                    </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", color: "#fff", flexDirection: "row-reverse" }}>
                    <div style={{ flex: "1 1 350px", minHeight: "300px", position: "relative", }}>
                        <Image alt="food" src={"/projects/projectThree/food3.png"} fill={true} sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: "cover" }} />
                    </div>

                    <div style={{ flex: "1 1 350px", display: "grid", gap: "1rem", padding: "4rem 2rem", backgroundColor: "var(--bg1)", textAlign: "center", justifyItems: "center" }}>
                        <h3 style={{ justifySelf: "stretch", "--lineColor": "#fff" } as React.CSSProperties} className={styles.linedText}>DECADENT</h3>

                        <div style={{ display: "grid" }}>
                            <h1 style={{}}>OREO</h1>

                            <h1 style={{ color: "var(--color3)" }}>CHEESECAKE</h1>
                        </div>

                        <p style={{ fontWeight: "500", textTransform: "uppercase", maxWidth: "30ch" }}>For dessert lovers</p>

                        <p style={{ maxWidth: "40ch", lineHeight: "1.7em" }}>Our Decadent Oreo Cheesecake is the ultimate treat. This rich and creamy cheesecake is infused with crushed Oreo cookies and topped with a layer of luscious chocolate ganache. Finished with a dollop of whipped cream and more Oreo crumbles, this dessert is perfect for indulging your sweet tooth.</p>

                        <Button1 text='view menus' link='' style={{ marginTop: "2rem", backgroundColor: "var(--color3)" }} />
                    </div>
                </div>
            </section>

            <section style={{ padding: "0rem 0rem", position: "relative", marginBlock: "2rem" }}>
                <Image alt="food" src={"/projects/projectThree/food4.jpg"} width={1000} height={1000} style={{ objectFit: "cover", width: "100%", height: "400px" }} />

                <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0, backgroundColor: "rgba(0,0,0,0.2)" }}></div>

                <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0, display: "grid", justifyItems: "center", textAlign: "center" }}>
                    <div style={{ display: "grid", alignSelf: "flex-start" }}>
                        <h1>SIRLOIN</h1>

                        <h1 style={{ color: "var(--color1)" }}>STAKE</h1>
                    </div>

                    <Button1 text='view menus' link='' style={{ backgroundColor: "var(--color1)", marginTop: "auto", alignSelf: "flex-end" }} />
                </div>
            </section>

            <section>
                <h3 className={styles.linedText} style={{ margin: "2rem 1rem", }}>Subscribe now</h3>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center", alignItems: "center", maxWidth: "800px", margin: "0 auto" }}>
                    <p style={{ flex: "0 1 300px", color: "#fff", textAlign: "end" }}>Subscribe now to receive fresh deals & offers by email.</p>

                    <input style={{ flex: "1 1 300px", }} type="text" placeholder="Email" defaultValue={""} />

                    <Button1 text='sign up' link='' style={{}} />
                </div>

            </section>

            <Footer />
        </main>
    )
}
