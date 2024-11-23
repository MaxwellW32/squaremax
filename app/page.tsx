import { getTemplates } from "@/serverFunctions/handleTemplates"
import styles from "./page.module.css"
// import { template } from "@/types"
// import AddDefaultDataButton from "@/components/AddDefaultDataButton"

export default async function Home() {
  const templates = await getTemplates()

  return (
    <main className={styles.main}>
      <h1>Get a Website today</h1>

      {/* <AddDefaultDataButton /> */}

      <div className={styles.templatesCont}>
        {templates.map(eachTemplate => {
          return (
            <div key={eachTemplate.id} className={styles.templateCont}>
              <iframe src={eachTemplate.url} width={"100%"} height={"100%"} />

              <div style={{ padding: "1rem", backgroundColor: "rgb(var(--shade2))", display: "grid", alignContent: "flex-start" }}>
                <button className="tag toolTip" data-tooltip="copy template id" style={{ justifySelf: "flex-end" }}>{eachTemplate.id}</button>

                <h3>{eachTemplate.name}</h3>

                {/* categories */}
                {/* styles */}
                {/* add to project button / start new project with template */}
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
