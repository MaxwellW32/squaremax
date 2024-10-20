import { getTemplates } from "@/serverFunctions/handleTemplates"
import styles from "./page.module.css"
import AddDefaultDataButton from "@/components/AddDefaultDataButton"

//each  template on build overrides the jotai variable for the regular object, imported from the same global file - so keep names the same
//get rid of "use clients" if the next line doesn't have keep under it
//also remove the jotai implementations and import the object from the global form
//basically build out a few templates and try to sync everything
//make a global list of font and allow allow file download into the downloaded template - check out how to dynamically load fonts 

export default async function Home() {
  const templates = await getTemplates()

  return (
    <main className={styles.main}>
      <p>Get a Website today</p>

      <AddDefaultDataButton />

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
