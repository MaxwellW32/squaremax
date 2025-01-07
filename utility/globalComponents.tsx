import { checkIfFileExists } from '@/serverFunctions/handleServerFiles';
import { componentDataType } from '@/types';
import dynamic from 'next/dynamic';
import path from 'path';

export default async function globalDynamicComponents(id: string) {
    const filePath = path.join("userWebsiteComponents", id, "page.tsx")

    const fileExists = await checkIfFileExists(filePath)
    if (!fileExists) return undefined

    const dynamicComponents: { [key: string]: () => React.ComponentType<{ data: componentDataType }> } = {
        "d75921ba-3f67-4fdc-93c1-267d309ed394": () => dynamic(() => import(`@/userWebsiteComponents/${id}/page.tsx`), { ssr: false }),
        "123456va-3f67-4fdc-93c1-267d309ed394": () => dynamic(() => import(`@/userWebsiteComponents/${id}/page.tsx`), { ssr: false }),
    };//<marker>

    const SeenComponent = dynamicComponents[id];
    return SeenComponent;
}
