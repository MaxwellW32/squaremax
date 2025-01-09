import { checkIfFileExists } from '@/serverFunctions/handleServerFiles';
import { componentDataType } from '@/types';
import dynamic from 'next/dynamic';
import path from 'path';

export default async function globalDynamicComponents(id: string) {
    const filePath = path.join("userWebsiteComponents", id, "page.tsx")

    const fileExists = await checkIfFileExists(filePath)
    if (!fileExists) return undefined

    const dynamicComponents: { [key: string]: () => React.ComponentType<{ data: componentDataType }> } = {
"bb45e92e-9370-4506-9411-a3173b831b7e": () => dynamic(() => import(`@/userWebsiteComponents/${id}/page.tsx`), { ssr: false }),
"40f62987-edaa-41ec-9786-296e0928b5a7": () => dynamic(() => import(`@/userWebsiteComponents/${id}/page.tsx`), { ssr: false }),
    }//<marker>

    const SeenComponent = dynamicComponents[id];
    return SeenComponent;
}


