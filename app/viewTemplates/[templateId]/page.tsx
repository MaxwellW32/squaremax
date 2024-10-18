import { templatesInfo } from "@/lib/templatesInfo"

export default function Page({ params }: { params: { templateId: string } }) {

    return (
        <iframe src={templatesInfo[params.templateId].domain} />
    )
}


