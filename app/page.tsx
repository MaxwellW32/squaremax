
import { getTemplates } from "@/serverFunctions/handleTemplates"
import styles from "./page.module.css"
import Image from "next/image"
import Link from "next/link"
// import AddDefaultDataButton from "@/components/AddDefaultDataButton"

//want to feel like im making progress
//complete aaaa
//allow opening in new tab
//add basic styles
//maybe start a new template - landing page

export default async function Home() {
  const templates = await getTemplates()

  return (
    <main className={styles.main}>
      <p>Get a Website today</p>

      {/* <AddDefaultDataButton /> */}

      <div className={styles.templateCont}>
        {templates.map(eachTemplate => {
          return (
            <div key={eachTemplate.id} className={styles.template}>
              {/* background image */}
              <Image alt="bg" src={"https://images.pexels.com/photos/159045/the-interior-of-the-repair-interior-design-159045.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"} fill={true} style={{ objectFit: "cover" }} sizes="(max-width: 300px) 100vw, (max-width: 600px) 50vw, 33vw" />

              <div className={styles.templateInfo}>
                {/* more info */}
                <Link href={eachTemplate.url} target="blank_">{eachTemplate.name}</Link>

                {/* categories */}
                {/* styles */}
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
