import Footer from "./projectComponents/footer/Footer";
import Nav from "./projectComponents/nav/Nav";
import styles from "./page.module.css"

export default function FolliblancLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className={styles.mainLayout}>
            <Nav />

            {children}

            <Footer />
        </div>
    );
}
