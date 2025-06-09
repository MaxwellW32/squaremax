import React from 'react'
import Faq from '@/components/FAQ/FAQ'

export default function Page() {
    return (
        <main>
            <section>

                <section>
                    <div style={{ textAlign: "center", display: "grid", justifyItems: "center" }}>
                        <p className='supportingTitle2'>FAQ</p>
                        <h1>Popular Questions</h1>
                    </div>

                    <div style={{ display: "grid", maxWidth: "75ch", margin: "1rem auto", padding: "1rem", boxShadow: "0px 0px 40px 20px #eee" }}>
                        <Faq
                            question="What services do you offer?"
                            answer="We specialize in website development, mobile app development, cloud solutions integration, custom software development, UI/UX design, digital marketing integration, maintenance and support, consulting, and training."
                        />

                        <Faq
                            question="How long does it take to develop a website?"
                            answer="The time required to develop a website depends on various factors such as its complexity, features, and requirements. We'll provide you with a timeline estimate after discussing your project in detail."
                        />

                        <Faq
                            question="Do you provide ongoing support after the website is launched?"
                            answer="Yes, we offer ongoing maintenance and support services to ensure your website continues to run smoothly after launch. Our support team is available to address any issues and implement updates as needed."
                        />

                        <Faq
                            question="Can you help with search engine optimization (SEO)?"
                            answer="Yes, we can assist with optimizing your website for search engines to improve its visibility and rankings. We offer SEO services such as keyword research, on-page optimization, content creation, and link building."
                        />

                        <Faq
                            question="How do I get started with your services?"
                            answer="Simply reach out to us through our website, phone, or email to discuss your project requirements. We'll schedule a consultation to understand your needs and provide you with a customized proposal."
                        />

                    </div>
                </section>
            </section>
        </main>
    )
}
