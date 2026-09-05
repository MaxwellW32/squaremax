/** @type {import('next').NextConfig} */
const nextConfig = {
    //image uploads travel through a server action as FormData
    experimental: {
        serverActions: {
            bodySizeLimit: "12mb",
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**"
            },
            {
                protocol: "http",
                hostname: "localhost"
            }
        ]
    }
};

export default nextConfig;
