export type templatesInfoType = {
    [key: string]: {//id
        name: string,
        githubUrl: string,
        domain: string
    };
}

//different domain addresses in production vs dev
// domain: "http://localhost:3001"
export const templatesInfo: templatesInfoType = {
    "aaaa": {
        name: "testwebsite1",
        githubUrl: "https://github.com/MaxwellW32/aaaa.git",
        domain: "https://onedaywebsite-templates-aaaa.vercel.app"
    }
}
