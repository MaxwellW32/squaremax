import { websiteTemplatesDir } from '@/lib/websiteTemplateLib';
import { checkIfFileExists } from '@/serverFunctions/handleServerFiles';
import { templateDataType } from '@/types';
import dynamic from 'next/dynamic';
import path from 'path';

export default async function globalDynamicTemplates(id: string) {
    const filePath = path.join(websiteTemplatesDir, id, "page.tsx")

    const fileExists = await checkIfFileExists(filePath)
    if (!fileExists) return undefined

    const dynamicTemplate: { [key: string]: () => React.ComponentType<{ data: templateDataType }> } = {
        "bb45e92e-9370-4506-9411-a3173b831b7e": () => dynamic(() => import(`@/websiteTemplates/${id}/page.tsx`), { ssr: false }),
        "40f62987-edaa-41ec-9786-296e0928b5a7": () => dynamic(() => import(`@/websiteTemplates/${id}/page.tsx`), { ssr: false }),
        "4c5202e3-bf64-4d34-af6e-9ab16bb790ae": () => dynamic(() => import(`@/websiteTemplates/${id}/page.tsx`), { ssr: false }),
        "a60d39e9-f95b-4d95-912b-d5aafbce32b1": () => dynamic(() => import(`@/websiteTemplates/${id}/page.tsx`), { ssr: false }),
        "4eba14ab-7cea-4fdf-93da-6b0b554b248b": () => dynamic(() => import(`@/websiteTemplates/${id}/page.tsx`), { ssr: false }),
        "84e25301-9ab5-45e8-8f4a-3d6cb26a4485": () => dynamic(() => import(`@/websiteTemplates/${id}/page.tsx`), { ssr: false }),
"6d9bfeff-76dc-4d20-bff4-f3c75f9fe538": () => dynamic(() => import(`@/websiteTemplates/${id}/page.tsx`), { ssr: false }),
    }//<marker>

    const SeenComponent = dynamicTemplate[id];
    return SeenComponent;
}


