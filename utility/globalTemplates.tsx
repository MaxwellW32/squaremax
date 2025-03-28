import { websiteTemplatesDir } from '@/lib/websiteTemplateLib';
import { checkIfFileExists } from '@/serverFunctions/handleServerFiles';
import { templateDataType } from '@/types/templateDataTypes';
import dynamic from 'next/dynamic';
import path from 'path';

export default async function globalDynamicTemplates(id: string) {
    const filePath = path.join(websiteTemplatesDir, id, "page.tsx")

    const fileExists = await checkIfFileExists(filePath)
    if (!fileExists) return undefined

    const dynamicTemplate: { [key: string]: () => React.ComponentType<{ data: templateDataType }> } = {
        "33fd6f2a-a453-4f4d-9a47-9b2b07996a0e": () => dynamic(() => import(`@/websiteTemplates/${id}/page.tsx`), { ssr: false }),
        "f973417e-1649-4d06-a081-c76c7e5808d3": () => dynamic(() => import(`@/websiteTemplates/${id}/page.tsx`), { ssr: false }),
        "40cbfba0-6a21-4092-b4d1-11e1856bfdf3": () => dynamic(() => import(`@/websiteTemplates/${id}/page.tsx`), { ssr: false }),
    }//<marker>

    const SeenComponent = dynamicTemplate[id];
    return SeenComponent;
}


