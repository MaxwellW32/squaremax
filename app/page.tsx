import { getTemplates } from "@/serverFunctions/handleTemplates"
import styles from "./page.module.css"
import CopyTemplateIdButton from "@/components/templates/CopyTemplateIdButton"
// import Test from "@/components/Test"
// import { template } from "@/types"
// import AddDefaultDataButton from "@/components/AddDefaultDataButton"

//xxxneed a dedicated standard on viewing images - both on main and template
//xxxit will have the id, src, the type of image, and whether to download
//if its downloaded load it by its id
//allow uploads on main server - serve the image to child template
//download it locally on the child template once user wants to download

export default async function Home() {
  const templates = await getTemplates()

  return (
    <main className={styles.main}>
      <h1>Get a Website today</h1>

      {/* <AddDefaultDataButton /> */}

      {/* <Test /> */}

      <div className={styles.templatesCont}>
        {templates.map(eachTemplate => {
          return (
            <div key={eachTemplate.id} className={styles.templateCont}>
              <iframe src={eachTemplate.url} width={"100%"} height={"100%"} />

              <div style={{ padding: "1rem", backgroundColor: "rgb(var(--shade2))", display: "grid", alignContent: "flex-start" }}>
                <CopyTemplateIdButton template={eachTemplate} />

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
