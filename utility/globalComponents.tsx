import { userWebsiteComponentsDir } from '@/lib/userWebsiteComponents';
import { checkIfFileExists } from '@/serverFunctions/handleServerFiles';
import { componentDataType } from '@/types';
import dynamic from 'next/dynamic';
import path from 'path';

export default async function globalDynamicComponents(id: string) {
    const filePath = path.join(userWebsiteComponentsDir, id, "page.tsx")

    const fileExists = await checkIfFileExists(filePath)
    if (!fileExists) return undefined

    const dynamicComponents: { [key: string]: () => React.ComponentType<{ data: componentDataType }> } = {
        "bb45e92e-9370-4506-9411-a3173b831b7e": () => dynamic(() => import(`@/userWebsiteComponents/${id}/page.tsx`), { ssr: false }),
        "40f62987-edaa-41ec-9786-296e0928b5a7": () => dynamic(() => import(`@/userWebsiteComponents/${id}/page.tsx`), { ssr: false }),
        "4c5202e3-bf64-4d34-af6e-9ab16bb790ae": () => dynamic(() => import(`@/userWebsiteComponents/${id}/page.tsx`), { ssr: false }),
        "a60d39e9-f95b-4d95-912b-d5aafbce32b1": () => dynamic(() => import(`@/userWebsiteComponents/${id}/page.tsx`), { ssr: false }),
        "4eba14ab-7cea-4fdf-93da-6b0b554b248b": () => dynamic(() => import(`@/userWebsiteComponents/${id}/page.tsx`), { ssr: false }),
    }//<marker>

    const SeenComponent = dynamicComponents[id];
    return SeenComponent;
}


