"use server"
import nodemailer from "nodemailer"

require('dotenv').config()

const email = process.env.EMAIL
const pass = process.env.EMAIL_PASS

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: email,
        pass: pass,
    },
});

export async function sendNodeEmail(input: {
    sendTo: string,
    replyTo: string,
    subject: string,
    text: string,
}) {
    // const basePath = process.cwd()
    // const locationToTempaltes = path.join(basePath, "templates", "simple.html")
    // const htmlSource = await fs.readFile(locationToTempaltes, { encoding: "utf-8" })
    // const template = Handlebars.compile(htmlSource);

    const info = await transporter.sendMail({
        from: email,
        to: input.sendTo,
        subject: input.subject,
        text: input.text,
        // html: template({
        //     root: (
        //         `
        //         <div>
        //             ${Object.entries(input.pages).map(([key, value]) => {
        //             return (
        //                 `
        //                     <h1>${value.title}</h1>

        //                     ${value.questions.map(eachQuestionId => {
        //                     return (
        //                         `
        //                             <p>${input.moreFormInfo[eachQuestionId].label}</p>
        //                             <p>${input.specificationsObj[eachQuestionId]}</p>
        //                             <b>hi bold test</b>
        //                         `
        //                     )
        //                 })}

        //                     <br/><br/>
        //                     `
        //             )
        //         })}
        //         </div>
        //         `
        //     )
        // }),
        replyTo: input.replyTo
    });

    // console.log("Message sent: %s", info.messageId);
}