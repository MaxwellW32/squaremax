import DisplayBlogs from '@/components/displayBlogs/DisplayBlogs'
import ShowDate from '@/components/showDate/ShowDate'
import { blogData } from '@/lib/blogData'
import React from 'react'

export default function Page({ params }: { params: { slug: string } }) {
    const foundBlog = blogData.find(eachBlog => eachBlog.slug === params.slug)
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

                <DisplayBlogs passedBlogData={blogData.filter(eachBlog => eachBlog.slug !== params.slug)} />
            </section>
        </main>
    )
}
