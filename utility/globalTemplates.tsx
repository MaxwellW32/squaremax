import dynamic from 'next/dynamic';
import { templateDataType } from '@/types/templateDataTypes';

type templateComponent = React.ComponentType<{ data: templateDataType }>

//static registry: source code is not mutated at runtime (works with immutable deploys/ISR).
//adding a template = add its folder under websiteTemplates/ + one line here.
//each template narrows the data union to its own category at runtime (validated on save),
//so the cast to the union-consuming component type is safe at this boundary.
const templateComponents: { [key: string]: () => templateComponent } = {
    "33fd6f2a-a453-4f4d-9a47-9b2b07996a0e": () => dynamic(() => import("@/websiteTemplates/33fd6f2a-a453-4f4d-9a47-9b2b07996a0e/page"), { ssr: false }) as templateComponent,
    "f973417e-1649-4d06-a081-c76c7e5808d3": () => dynamic(() => import("@/websiteTemplates/f973417e-1649-4d06-a081-c76c7e5808d3/page"), { ssr: false }) as templateComponent,
    "40cbfba0-6a21-4092-b4d1-11e1856bfdf3": () => dynamic(() => import("@/websiteTemplates/40cbfba0-6a21-4092-b4d1-11e1856bfdf3/page"), { ssr: false }) as templateComponent,
};

export default async function globalDynamicTemplates(id: string) {
    return templateComponents[id];
}
