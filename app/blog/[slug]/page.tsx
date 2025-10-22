import DisplayBlogs from '@/components/displayBlogs/DisplayBlogs'
import ShowDate from '@/components/showDate/ShowDate'
import { blogData } from '@/lib/blogData'
import React from 'react'

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params

    const foundBlog = blogData.find(eachBlog => eachBlog.slug === slug)
    if (!foundBlog) return <p>Blog Not Found</p>

    return (
        <main>
            <section>
                <div style={{ maxWidth: "75ch", margin: "0 auto" }}>

                    <p>Date posted:  <ShowDate date={foundBlog.datePosted} /></p>
                    <h1>{foundBlog.title}</h1>

                    {foundBlog.component}
                </div>
            </section>

            <section>
                <h1>Other Blogs</h1>

                <DisplayBlogs passedBlogData={blogData.filter(eachBlog => eachBlog.slug !== slug)} />
            </section>
        </main>
    )
}
