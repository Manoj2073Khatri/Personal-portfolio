import React from 'react';
import { HiOutlineMail } from "react-icons/hi";
import { FaLinkedin } from "react-icons/fa";
import Link from 'next/link';

const Content = () => {
    return (
        <main id="content">
            <div className="w-full max-w-2xl mx-auto pt-10 px-4 sm:px-6 lg:px-8">

                <div className="flex items-center gap-x-3">
                    <div className="shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="shrink-0 size-16 rounded-full"
                            src="https://media.licdn.com/dms/image/v2/D4D03AQFDC5v9rnXFjw/profile-displayphoto-shrink_100_100/B4DZU4tf1RGcAg-/0/1740413207247?e=1763596800&v=beta&t=wPTZaflNyPnUtMATv3BFvgGgZVgKA85tJg-FAKF4Icc"
                            alt="Avatar" />
                    </div>

                    <div className="grow">
                        <h1 className="text-lg font-medium text-gray-800 dark:text-neutral-200">
                            Manoj Khatri
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-neutral-400">
                            FullStack developer(React.js / Node.js / AWS)
                        </p>
                    </div>
                </div>

                <div className="mt-8">
                    <p className="text-sm text-gray-600 dark:text-neutral-400">
                        I’m a passionate web developer with a strong foundation in both front-end and back-end technologies. I specialize in building modern, responsive, and user-friendly websites using tools like <b>React.js, Next.js, HTML, and CSS,</b> along with UI frameworks such as <b>Tailwind CSS, Bootstrap, and Material-UI.</b> I enjoy crafting clean, intuitive interfaces that not only look great but also deliver seamless user experiences. With a deep understanding of component-based architecture and accessibility best practices, I take pride in developing visually appealing and highly functional web solutions.
                    </p>

                    <p className="mt-3 text-sm text-gray-600 dark:text-neutral-400">
                        Beyond front-end development, I’m also experienced in <b>Node.js, Nest js ,GraphQL, and .NET</b>, allowing me to build robust and scalable back-end systems that integrate smoothly with modern front-end applications. My approach to development focuses on efficiency, maintainability, and collaboration—I love working with teams to bring ideas to life and deliver impactful digital experiences. Constantly learning and adapting to new technologies, I’m dedicated to writing quality code and creating innovative solutions that help businesses grow in the digital world.
                    </p>


                    <ul className="mt-5 flex flex-col gap-y-3">
                        <li className="flex items-center gap-x-2.5">
                            <HiOutlineMail />
                            <a className="text-[13px] text-gray-500 underline hover:text-gray-800 hover:decoration-2 focus:outline-hidden focus:decoration-2 dark:text-neutral-500 dark:hover:text-neutral-400"
                                href="mailto:manojkhatri2073@gmail.com">
                                manojkhatri2073@gmail.com
                            </a>
                        </li>

                        <li className="flex items-center gap-x-2.5">
                            <FaLinkedin />
                            <a className="text-[13px] text-gray-500 underline hover:text-gray-800 hover:decoration-2 focus:outline-hidden focus:decoration-2 dark:text-neutral-500 dark:hover:text-neutral-400"
                                href="https://www.linkedin.com/in/manoj-khatri-bba878202/">
                                https://www.linkedin.com/in/manoj-khatri-bba878202/
                            </a>
                        </li>
                    </ul>
                </div>

                <div className="mt-10 sm:mt-14">
                    <h2 className="mb-5 font-medium text-gray-800 dark:text-neutral-200">
                        Projects
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div className="group block relative overflow-hidden rounded-lg" >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img className="w-full size-40 object-cover bg-gray-100 rounded-lg dark:bg-neutral-800" height="164" width="347" alt="" src="https://d1m1s6un1a8qgj.cloudfront.net/media/portfolio_item_image/Screenshot_2025-06-26_at_12.29.46_AM.png" />
                            <div className="absolute bottom-1 end-1 opacity-0 group-hover:opacity-100 transition">
                                <div
                                    className="flex items-center gap-x-1 py-1 px-2 bg-white border border-gray-200 text-gray-800 rounded-lg dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-200">
                                    <svg className="shrink-0 size-3" xmlns="http://www.w3.org/2000/svg" width="24"
                                        height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="m21 21-4.3-4.3" />
                                    </svg>
                                    <a href='https://www.gaikhuratravels.com/'><span className="text-xs">View</span></a>
                                </div>
                            </div>
                        </div>

                        <div className="group block relative overflow-hidden rounded-lg" >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img className="w-full size-40 object-cover bg-gray-100 rounded-lg dark:bg-neutral-800" height="164" width="347" alt="" src="https://d1m1s6un1a8qgj.cloudfront.net/media/portfolio_item_image/Screenshot_2025-06-26_at_12.31.35_AM.png" />
                            <div className="absolute bottom-1 end-1 opacity-0 group-hover:opacity-100 transition">
                                <div
                                    className="flex items-center gap-x-1 py-1 px-2 bg-white border border-gray-200 text-gray-800 rounded-lg dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-200">
                                    <svg className="shrink-0 size-3" xmlns="http://www.w3.org/2000/svg" width="24"
                                        height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="m21 21-4.3-4.3" />
                                    </svg>
                                    <a href='https://equip-bid.vercel.app/'><span className="text-xs">View</span></a>
                                </div>
                            </div>
                        </div>

                        <div className="group block relative overflow-hidden rounded-lg" >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img className="w-full size-40 object-cover bg-gray-100 rounded-lg dark:bg-neutral-800" height="164" width="347" alt="" src="https://d1m1s6un1a8qgj.cloudfront.net/media/portfolio_item_image/Screenshot_2025-06-26_at_12.33.27_AM.png" />
                            <div className="absolute bottom-1 end-1 opacity-0 group-hover:opacity-100 transition">
                                <div
                                    className="flex items-center gap-x-1 py-1 px-2 bg-white border border-gray-200 text-gray-800 rounded-lg dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-200">
                                    <svg className="shrink-0 size-3" xmlns="http://www.w3.org/2000/svg" width="24"
                                        height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="m21 21-4.3-4.3" />
                                    </svg>
                                    <a href='https://policypowerhouse.com/holiday-let-insurance/'><span className="text-xs">View</span></a>
                                </div>
                            </div>
                        </div>

                        <div className="group block relative overflow-hidden rounded-lg" >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img className="w-full size-40 object-cover bg-gray-100 rounded-lg dark:bg-neutral-800" height="164" width="347" alt="" src="https://d1m1s6un1a8qgj.cloudfront.net/media/portfolio_item_image/Screenshot_2025-06-26_at_12.38.22_AM.png" />
                            <div className="absolute bottom-1 end-1 opacity-0 group-hover:opacity-100 transition">
                                <div
                                    className="flex items-center gap-x-1 py-1 px-2 bg-white border border-gray-200 text-gray-800 rounded-lg dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-200">
                                    <svg className="shrink-0 size-3" xmlns="http://www.w3.org/2000/svg" width="24"
                                        height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="m21 21-4.3-4.3" />
                                    </svg>
                                    <a href='https://www.flextechdesign.com/'><span className="text-xs">View</span></a>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>


                <div className="mt-10 sm:mt-14">
                    <h2 className="mb-3 font-medium text-gray-800 dark:text-neutral-200">
                        Testimonials
                    </h2>

                    <div
                        className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 border-y border-gray-200 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:border-neutral-700 dark:divide-neutral-700">
                        <div className="sm:-ms-4 py-6 sm:px-4">

                            <blockquote>
                                <span className="text-sm text-gray-800 dark:text-neutral-200">I&#39;m absolutely floored by the level of care and attention to detail Manoj has put into this project and for one can guarantee that we will be a return customer.</span>

                                <footer className="mt-3">
                                    <div className="flex items-center gap-x-2">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img className="shrink-0 size-5 rounded-full"
                                            src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=320&h=320&q=80"
                                            alt="Avatar" />
                                        <div className="grow">
                                            <div className="text-xs text-gray-500 dark:text-neutral-500">Josh Grazioso
                                            </div>
                                        </div>
                                    </div>
                                </footer>
                            </blockquote>

                        </div>

                        <div className="py-6 sm:px-4">

                            <blockquote>
                                <span className="text-sm text-gray-800 dark:text-neutral-200">To say that hiring Manoj has been life-changing is an understatement. My business has tripled and I got my life back.</span>

                                <footer className="mt-3">
                                    <div className="flex items-center gap-x-2">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img className="shrink-0 size-5 rounded-full"
                                            src="https://images.unsplash.com/photo-1671726203390-cdc4354ee2eb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=320&h=320&q=80"
                                            alt="Avatar" />
                                        <div className="grow">
                                            <div className="text-xs text-gray-500 dark:text-neutral-500">Nicole
                                                Grazioso
                                            </div>
                                        </div>
                                    </div>
                                </footer>
                            </blockquote>

                        </div>
                    </div>

                </div>

                <div className="my-10 sm:my-14">
                    <h2 className="mb-5 font-medium text-gray-800 dark:text-neutral-200">
                        Skills
                    </h2>

                    <div className="space-y-3">
                        <dl className="flex flex-col sm:flex-row gap-1">
                            <dt className="min-w-40">
                                <span className="block text-sm text-gray-500 dark:text-neutral-500">Front-End:</span>
                            </dt>
                            <dd>
                                <ul>
                                    <li className="me-1 after:content-[','] inline-flex items-center text-sm text-gray-800 dark:text-neutral-200">

                                        HTML · CSS · JavaScript · React.js · Next.js · Vue.js · Tailwind CSS · Bootstrap · Material-UI · Responsive Design · UI/UX Design
                                    </li>
                                </ul>
                            </dd>
                        </dl>

                        <dl className="flex flex-col sm:flex-row gap-1">
                            <dt className="min-w-40">
                                <span className="block text-sm text-gray-500 dark:text-neutral-500">Back-End:</span>
                            </dt>
                            <dd>
                                <ul>
                                    <li className="me-1 after:content-[','] inline-flex items-center text-sm text-gray-800 dark:text-neutral-200">

                                        Node.js · Express.js · GraphQL · RESTful APIs · .NET · C# · Database Integration · Server-Side Development
                                    </li>

                                </ul>
                            </dd>
                        </dl>

                        <dl className="flex flex-col sm:flex-row gap-1">
                            <dt className="min-w-40">
                                <span
                                    className="block text-sm text-gray-500 dark:text-neutral-500">Collaboration & Tools:</span>
                            </dt>
                            <dd>
                                <ul>
                                    <li className="me-1 after:content-[','] inline-flex items-center text-sm text-gray-800 dark:text-neutral-200">

                                        Notion · Slack · Figma · Sketch · Mailchimp
                                    </li>
                                </ul>
                            </dd>
                        </dl>

                        <dl className="flex flex-col sm:flex-row gap-1">
                            <dt className="min-w-40">
                                <span className="block text-sm text-gray-500 dark:text-neutral-500">Soft Skills:</span>
                            </dt>
                            <dd>
                                <ul>
                                    <li className="me-1 after:content-[','] inline-flex items-center text-sm text-gray-800 dark:text-neutral-200">
                                        Strong communication
                                    </li>
                                    <li className="me-1 after:content-[','] inline-flex items-center text-sm text-gray-800 dark:text-neutral-200">
                                        Problem-solving
                                    </li>
                                    <li className="me-1 after:content-[','] inline-flex items-center text-sm text-gray-800 dark:text-neutral-200">
                                        Attention to detail
                                    </li>
                                    <li className="me-1 after:content-[','] inline-flex items-center text-sm text-gray-800 dark:text-neutral-200">
                                        Time management
                                    </li>
                                </ul>
                            </dd>
                        </dl>
                    </div>

                </div>

                <div className="mt-10 sm:mt-14">
                    <h2 className="mb-5 font-medium text-gray-800 dark:text-neutral-200">
                        Work experience
                    </h2>


                    <div>

                        <div className="group relative flex gap-x-5">

                            <div
                                className="relative group-last:after:hidden after:absolute after:top-8 after:bottom-2 after:start-3 after:w-px after:-translate-x-[0.5px] after:bg-gray-200 dark:after:bg-neutral-700">
                                <div className="relative z-10 size-6 flex justify-center items-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img width="48" src="https://media.licdn.com/dms/image/v2/C4E0BAQF2DCBXgX7OnQ/company-logo_100_100/company-logo_100_100/0/1630609448998?e=1763596800&amp;v=beta&amp;t=84jAxIeVi5jygLVk7q8K5SH5PoSEU55jdPKNmJXEabc" loading="lazy" height="48" alt="AeriTech logo" id="ember1519" />
                                </div>
                            </div>

                            <div className="grow pb-8 group-last:pb-0">
                                <h3 className="mb-1 text-xs text-gray-600 dark:text-neutral-400">
                                    May 2023 - Present
                                </h3>

                                <p className="font-semibold text-sm text-gray-800 dark:text-neutral-200">
                                    Senior Software Developer at <b>Aeritech LLC</b>
                                </p>

                                <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                                    -Version upgrading and code refactoring using best practices <br />
                                    -Developing new features by collaborating with the Clients <br />
                                    -Working on bidding sites and mobile apps on both frontend and backend

                                </p>


                            </div>

                        </div>

                        <div className="group relative flex gap-x-5">

                            <div
                                className="relative group-last:after:hidden after:absolute after:top-8 after:bottom-2 after:start-3 after:w-px after:-translate-x-[0.5px] after:bg-gray-200 dark:after:bg-neutral-700">
                                <div className="relative z-10 size-6 flex justify-center items-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img width="48" src="https://media.licdn.com/dms/image/v2/C4D0BAQFRuifaqVCAog/company-logo_100_100/company-logo_100_100/0/1630492369958/labsvesuvio_logo?e=1763596800&amp;v=beta&amp;t=r7fO2h8U8XVns-TYsVtrWw0bFJCX1CG8KyRTMYrYTHk" loading="lazy" height="48" alt="Vesuvio Labs logo" id="ember1523" />
                                </div>
                            </div>

                            <div className="grow pb-8 group-last:pb-0">
                                <h3 className="mb-1 text-xs text-gray-600 dark:text-neutral-400">
                                    Dec 2021 - Mar 2023
                                </h3>

                                <p className="font-semibold text-sm text-gray-800 dark:text-neutral-200">
                                    Frontend Engineer at <b>Vesuvio Labs</b>
                                </p>

                                <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                                    - Wireframing the design by consulting with clients for both user journey and backOffice dashboards in figma <br />
                                    - Converting the design into clean code using bootstrap and react js flows <br />
                                    - Implementing frontend best practices, refactoring old codes <br />
                                    - Worked on the insurance sites and dashboards

                                </p>
                            </div>

                        </div>

                        <div className="group relative flex gap-x-5">

                            <div
                                className="relative group-last:after:hidden after:absolute after:top-8 after:bottom-2 after:start-3 after:w-px after:-translate-x-[0.5px] after:bg-gray-200 dark:after:bg-neutral-700">
                                <div className="relative z-10 size-6 flex justify-center items-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img width="48" src="https://media.licdn.com/dms/image/v2/C560BAQGe1SJezsZOUQ/company-logo_100_100/company-logo_100_100/0/1630668787104/medicosnpl_logo?e=1763596800&amp;v=beta&amp;t=RaIcdYpnkLHad9GvgJSnhLkECrSyhgAcCSRszoULVYA" loading="lazy" height="48" alt="Medicos International logo" id="ember1527" />
                                </div>
                            </div>

                            <div className="grow pb-8 group-last:pb-0">
                                <h3 className="mb-1 text-xs text-gray-600 dark:text-neutral-400">
                                    May 2011 - Dec 2021
                                </h3>

                                <p className="font-semibold text-sm text-gray-800 dark:text-neutral-200">
                                    React Developer at <b>Medicos International</b>
                                </p>

                                <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                                    - planning features regarding projects and research in various web development practices <br />
                                    - learn and gain expertise on various tools for performance and security <br />
                                    - converting figma wireframes into high quality code based on react js workflows <br />
                                    - worked on the medical pdf site used by medical students for learning

                                </p>
                            </div>

                        </div>



                    </div>

                </div>



                <div className="mt-10 sm:mt-14">
                    <h2 className="mb-3 font-medium text-gray-800 dark:text-neutral-200">
                        Education
                    </h2>


                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-4 border border-gray-200 rounded-lg dark:border-neutral-700">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="https://kec.edu.np/wp-content/uploads/2024/06/KEC-College-logo-2-1.png" alt="Kantipur engineering college" className="mb-3 shrink-0 w-12 h-12" />
                            <h3 className="mb-1 text-xs text-gray-600 dark:text-neutral-400">
                                2016 - 2020
                            </h3>

                            <p className="font-semibold text-sm text-gray-800 dark:text-neutral-200">
                                Bachelor's degree in Computer Software Engineering
                            </p>

                            <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                                Kantipur Engineering College, Kathmandu, Nepal
                            </p>
                        </div>

                        <div className="p-4 border border-gray-200 rounded-lg dark:border-neutral-700">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="https://wms.edigitalnepal.com/wms/files/ws-profile/1706026903084_997fc06b-a245-473c-a21f-7d2d1eaa2732.png" alt="Adarsh college " className="mb-3 shrink-0 w-12 h-12" />

                            <h3 className="mb-1 text-xs text-gray-600 dark:text-neutral-400">
                                2013 - 2015
                            </h3>

                            <p className="font-semibold text-sm text-gray-800 dark:text-neutral-200">
                                +2 Science
                            </p>

                            <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                                Adarsh Higher Secondary College
                            </p>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-lg dark:border-neutral-700">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="https://media.edusanjal.com/__sized__/logos/481013630_1365081934666013_4508007565349060233_n-thumbnail-200x200-70.jpg" alt="Adarsh college " className="mb-3 shrink-0 w-12 h-12" />

                            <h3 className="mb-1 text-xs text-gray-600 dark:text-neutral-400">
                                2009 - 2013
                            </h3>

                            <p className="font-semibold text-sm text-gray-800 dark:text-neutral-200">
                                SLC
                            </p>

                            <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                                Golden ABC Academy ,Nepalgunj, Banke
                            </p>
                        </div>
                    </div>
                </div>

                <div className="my-10 sm:my-14">
                    <h2 className="mb-5 font-medium text-gray-800 dark:text-neutral-200">
                        Articles
                    </h2>


                    <ul className="space-y-10">
                        <li>
                            <p className="mb-2 text-sm text-gray-500 dark:text-neutral-500">
                                2024
                            </p>
                            <h5 className="font-medium text-sm text-gray-800 dark:text-neutral-200">
                                The complete guide to React Hooks
                            </h5>
                            <p className="mt-1 text-sm text-gray-500 dark:text-neutral-500">
                                How to clearly understand and visualize react hooks.
                            </p>
                            <p className="mt-1">
                                <Link className="text-sm text-gray-500 underline hover:text-gray-800 hover:decoration-2 focus:outline-hidden focus:decoration-2 dark:text-neutral-500 dark:hover:text-neutral-400"
                                    href="/">
                                    Continue reading
                                </Link>
                            </p>
                        </li>

                        <li>
                            <p className="mb-2 text-sm text-gray-500 dark:text-neutral-500">
                                2024
                            </p>
                            <h5 className="font-medium text-sm text-gray-800 dark:text-neutral-200">
                                Understanding Authentication and Authorization in Web Development
                            </h5>
                            <p className="mt-1 text-sm text-gray-500 dark:text-neutral-500">
                                A comprehensive guide to authentication and authorization mechanisms in web applications.
                            </p>

                            <p className="mt-1">
                                <Link className="text-sm text-gray-500 underline hover:text-gray-800 hover:decoration-2 focus:outline-hidden focus:decoration-2 dark:text-neutral-500 dark:hover:text-neutral-400"
                                    href="/">
                                    Continue reading
                                </Link>
                            </p>
                        </li>

                        <li>
                            <p className="mb-2 text-sm text-gray-500 dark:text-neutral-500">
                                2023
                            </p>
                            <h5 className="font-medium text-sm text-gray-800 dark:text-neutral-200">
                                Clean Coding Architecture
                            </h5>
                            <p className="mt-1 text-sm text-gray-500 dark:text-neutral-500">
                                Best practices and principles for writing clean, maintainable, and scalable code in software development.
                            </p>
                            <p className="mt-1">
                                <Link className="text-sm text-gray-500 underline hover:text-gray-800 hover:decoration-2 focus:outline-hidden focus:decoration-2 dark:text-neutral-500 dark:hover:text-neutral-400"
                                    href="/">
                                    Continue reading
                                </Link>
                            </p>
                        </li>
                    </ul>
                </div>

                <div className="my-10 sm:my-14">
                    <h2 className="mb-5 font-medium text-gray-800 dark:text-neutral-200">
                        Subscribe
                    </h2>


                    <form>
                        <div
                            className="p-1.5 flex flex-col sm:flex-row items-center gap-2 border border-gray-200 rounded-lg dark:border-neutral-700">
                            <div className="relative w-full">
                                <label htmlFor="hero-input" className="sr-only">Subscribe</label>
                                <div
                                    className="absolute inset-y-0 start-0 flex items-center pointer-events-none z-20 ps-3">
                                    <svg className="shrink-0 size-4 text-gray-400 dark:text-neutral-600"
                                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                        strokeLinejoin="round">
                                        <rect width="20" height="16" x="2" y="4" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                </div>
                                <input type="text" id="hero-input" name="hero-input"
                                    className="py-1.5 sm:py-2 ps-9 pe-3 block w-full border-transparent rounded-lg sm:text-sm focus:border-transparent focus:ring-transparent disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:text-neutral-400 dark:placeholder-neutral-500"
                                    placeholder="Enter your email" />
                            </div>
                            <Link className="w-full sm:w-auto whitespace-nowrap py-2 px-2.5 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-md border border-transparent bg-gray-800 text-white hover:bg-gray-900 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:bg-white dark:text-neutral-800 dark:hover:bg-neutral-200"
                                href="/">
                                Join
                                <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24"
                                    height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                    strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14" />
                                    <path d="m12 5 7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-neutral-500">
                            No spam, unsubscribe at any time.
                        </p>
                    </form>

                </div>

            </div>
        </main>
    );
};

export default Content;