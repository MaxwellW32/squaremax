import { getGithubRepos, pushToGithubRepo } from '@/serverFunctions/handleGithub'
import { githubRepo, githubTokenType, requestDownloadWebsiteBodySchema, requestDownloadWebsiteBodyType, website } from '@/types'
import { consoleAndToastError } from '@/usefulFunctions/consoleErrorWithToast'
import React, { HTMLAttributes, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import AddEditGithub from '../users/addEditGithub/AddEditGithub'
import { deleteUserGithubTokens, getUser } from '@/serverFunctions/handleUser'
import { Session } from 'next-auth'
import ShowMore from '../showMore/ShowMore'
import ConfirmationBox from '../confirmationBox/ConfirmationBox'

export default function DownloadOptions({ seenSession, seenWebsite, seenGithubTokens, viewingDownloadOptionsSet, ...elProps }: {
    seenSession: Session, seenWebsite: website, seenGithubTokens: githubTokenType[], viewingDownloadOptionsSet?: React.Dispatch<React.SetStateAction<boolean>>
} & HTMLAttributes<HTMLDivElement>) {
    const [githubTokens, githubTokensSet] = useState<githubTokenType[]>(seenGithubTokens)
    const [downloadOption, downloadOptionSet] = useState<"zip" | "github">("zip")

    const activeGithubToken = githubTokens.find(eachGithubToken => eachGithubToken.active)

    const [repositories, repositoriesSet] = useState<githubRepo[]>([])

    async function handleWebsiteDownload(data: { option: "zip" } | { option: "github", data: { token: githubTokenType, websiteId: website["id"], repoName: string } }) {
        try {
            //build site
            //zip it
            //download it
            //offer upload to github - sort out settings
            const newrequestDownloadWebsiteBody: requestDownloadWebsiteBodyType = {
                websiteId: seenWebsite.id,
                downloadOption: data.option
            }

            //validation
            requestDownloadWebsiteBodySchema.parse(newrequestDownloadWebsiteBody)

            const response = await fetch(`/api/downloadWebsite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newrequestDownloadWebsiteBody),
            })

            if (data.option === "zip") {
                //download action
                const responseBlob = await response.blob()
                const url = window.URL.createObjectURL(responseBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${seenWebsite.name}.zip`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

            } else if (data.option === "github") {
                //upload to github with selection

                toast.success("ready for github upload")
                await pushToGithubRepo(data.data.token, seenWebsite.id, data.data.repoName)
                toast.success("pushed to trepo for github upload")
            }


        } catch (error) {
            consoleAndToastError(error)
        }
    }

    //on load get repositories
    useEffect(() => {
        handleRepoSearch()

    }, [])

    async function handleRepoSearch() {
        if (activeGithubToken === undefined) return

        const seenRepositories = await getGithubRepos(activeGithubToken.token)
        repositoriesSet(seenRepositories)
    }

    async function handleGetGithubTokens() {
        try {
            const seenUser = await getUser({ id: seenSession.user.id })
            if (seenUser === undefined) throw new Error("not seeing user")

            githubTokensSet(seenUser.userGithubTokens)

        } catch (error) {
            consoleAndToastError(error)
        }
    }


    return (
        <div {...elProps} style={{ display: "grid", alignContent: "flex-start", position: "fixed", top: "50%", left: "50%", translate: "-50% -50%", width: "min(500px, 95vw)", height: "80vh", backgroundColor: "rgb(var(--shade2))", zIndex: 10, overflowY: "auto", ...elProps?.style }}>
            <div style={{ display: "flex", overflowX: "auto" }}>
                <button className='mainButton' style={{ backgroundColor: downloadOption === "github" ? "rgb(var(--color1))" : "" }}
                    onClick={() => {
                        downloadOptionSet("github")
                    }}>github</button>

                <button className='mainButton' style={{ backgroundColor: downloadOption === "zip" ? "rgb(var(--color1))" : "" }}
                    onClick={() => {
                        downloadOptionSet("zip")
                    }}>zip</button>

                <button className='mainButton'
                    onClick={() => {
                        if (viewingDownloadOptionsSet !== undefined) {
                            viewingDownloadOptionsSet(false)
                        }
                    }}>close</button>
            </div>

            <div style={{ display: "grid", alignContent: "flex-start", gap: "1rem", padding: "1rem" }}>
                {activeGithubToken === undefined ? (
                    <>
                        {githubTokens.map(eachGithubToken => {
                            return (
                                <div key={eachGithubToken.id}>
                                    <button className='mainButton'
                                        onClick={() => {
                                            githubTokensSet((prevGithubTokens => {
                                                // set active on all to false
                                                const newGithubTokens = prevGithubTokens.map(eachPrevGithubToken => {
                                                    eachPrevGithubToken.active = eachPrevGithubToken.id === eachGithubToken.id

                                                    return eachPrevGithubToken
                                                })

                                                return newGithubTokens
                                            }))
                                        }}
                                    >{eachGithubToken.username}</button>

                                    <ShowMore label='edit'
                                        content={
                                            <AddEditGithub sentGithubToken={eachGithubToken}
                                                functionSubmit={() => {
                                                    //get latest 
                                                    handleGetGithubTokens()
                                                }}
                                            />
                                        }
                                    />

                                    <ConfirmationBox text='' confirmationText='are you sure you want to delete this github token?' successMessage='token deleted!'
                                        icon={
                                            <svg style={{ fill: "rgb(var(--shade2))" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z" /></svg>
                                        }
                                        runAction={async () => {
                                            const seenLatestTokens = await deleteUserGithubTokens({ id: seenSession.user.id, userGithubTokens: [eachGithubToken] })

                                            githubTokensSet(seenLatestTokens)
                                        }}
                                    />
                                </div>
                            )
                        })}

                        <ShowMore label='add token'
                            content={
                                <AddEditGithub
                                    functionSubmit={() => {
                                        //get latest 
                                        handleGetGithubTokens()
                                    }}
                                />
                            }
                        />
                    </>
                ) : (
                    <>
                        <label
                            onClick={() => {
                                githubTokensSet((prevGithubTokens => {
                                    // set active on all to false
                                    const newGithubTokens = prevGithubTokens.map(eachPrevGithubToken => {
                                        eachPrevGithubToken.active = false

                                        return eachPrevGithubToken
                                    })

                                    return newGithubTokens
                                }))
                            }}
                        >{activeGithubToken.username}</label>
                    </>
                )}
            </div>

            <div style={{ display: "grid", alignContent: "flex-start", padding: "1rem", overflowY: "auto" }}>
                {downloadOption === "zip" && (
                    <>
                        <button
                            onClick={() => {
                                handleWebsiteDownload({ option: "zip" })
                            }}
                        >D</button>
                    </>
                )}

                {downloadOption === "github" && activeGithubToken !== undefined && (
                    <>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button className='secondaryButton'
                                onClick={handleRepoSearch}
                            >refresh</button>
                        </div>

                        {repositories.map(eachRepository => {
                            return (
                                <div key={eachRepository.id} style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "1rem", overflowX: "auto" }}>
                                    <p >{eachRepository.name}</p>

                                    <p style={{ flex: 1 }}>
                                        - {eachRepository.updated_at}
                                    </p>

                                    <button
                                        onClick={() => {
                                            if (activeGithubToken == undefined) return

                                            //push to this repo
                                            handleWebsiteDownload({ option: "github", data: { token: activeGithubToken, repoName: eachRepository.name, websiteId: seenWebsite.id } })
                                        }}
                                    >D</button>
                                </div>
                            )
                        })}
                    </>
                )}
            </div>
        </div>
    )
}
