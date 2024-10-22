import { getTemplates } from "@/serverFunctions/handleTemplates"
import styles from "./page.module.css"
// import AddDefaultDataButton from "@/components/AddDefaultDataButton"

export default async function Home() {
  const templates = await getTemplates()

  return (
    <main className={styles.main}>
      <p>Get a Website today</p>

      {/* <AddDefaultDataButton /> */}

      <div className={styles.templateCont}>
        {templates.map(eachTemplate => {
          return (
            <div key={eachTemplate.id} style={{ width: "min(300px, 100%)", height: "400px", position: "relative", zIndex: 0 }}>
              <iframe src={eachTemplate.url} style={{ width: "100%", height: "100%" }} />

              <div style={{ zIndex: 1, position: "absolute", bottom: 0, left: 0, width: "100%" }}>
                <p>{eachTemplate.name}</p>

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
