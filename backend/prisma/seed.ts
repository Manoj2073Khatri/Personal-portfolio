/**
 * Seeds the CMS with the content that was previously hardcoded in
 * frontend/src/app/components/Content.tsx. Safe to re-run: every record is
 * created only if missing, so edits made in the admin are never overwritten.
 *
 * Does NOT create users. Use `npm run admin:create` for the admin account.
 */
import { config } from 'dotenv';
import {
  ContentStatus,
  CredentialKind,
  MediaKind,
  MediaStatus,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

config({ path: '.env.local', quiet: true });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function externalImage(url: string, alt: string): Promise<string> {
  const existing = await prisma.media.findFirst({
    where: { externalUrl: url },
  });
  if (existing) return existing.id;
  const filename = decodeURIComponent(
    new URL(url).pathname.split('/').pop() || 'image',
  );
  const media = await prisma.media.create({
    data: {
      kind: MediaKind.IMAGE,
      status: MediaStatus.READY,
      externalUrl: url,
      filename: filename.slice(0, 200),
      mimeType: url.includes('.png') ? 'image/png' : 'image/jpeg',
      alt,
    },
  });
  return media.id;
}

async function seedSettings() {
  const profileImageId = await externalImage(
    'https://media.licdn.com/dms/image/v2/D4D03AQFDC5v9rnXFjw/profile-displayphoto-shrink_100_100/B4DZU4tf1RGcAg-/0/1740413207247?e=1763596800&v=beta&t=wPTZaflNyPnUtMATv3BFvgGgZVgKA85tJg-FAKF4Icc',
    'Manoj Khatri',
  );
  const bio = [
    "I'm a passionate web developer with a strong foundation in both front-end and back-end technologies. I specialize in building modern, responsive, and user-friendly websites using tools like **React.js, Next.js, HTML, and CSS,** along with UI frameworks such as **Tailwind CSS, Bootstrap, and Material-UI.** I enjoy crafting clean, intuitive interfaces that not only look great but also deliver seamless user experiences. With a deep understanding of component-based architecture and accessibility best practices, I take pride in developing visually appealing and highly functional web solutions.",
    "Beyond front-end development, I'm also experienced in **Node.js, Nest js, GraphQL, and .NET**, allowing me to build robust and scalable back-end systems that integrate smoothly with modern front-end applications. My approach to development focuses on efficiency, maintainability, and collaboration—I love working with teams to bring ideas to life and deliver impactful digital experiences. Constantly learning and adapting to new technologies, I'm dedicated to writing quality code and creating innovative solutions that help businesses grow in the digital world.",
  ].join('\n\n');

  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'Manoj Khatri',
      title: 'FullStack developer (React.js / Node.js / AWS)',
      intro: '',
      bio,
      email: 'manojkhatri2073@gmail.com',
      socialLinks: [
        {
          platform: 'linkedin',
          label: 'LinkedIn',
          url: 'https://www.linkedin.com/in/manoj-khatri-bba878202/',
        },
      ],
      navigation: [
        { label: 'Intro', href: '/' },
        { label: 'Projects', href: '/projects' },
        { label: 'Articles', href: '/articles' },
      ],
      footerText: '© Manoj Khatri',
      homepageSections: [
        'projects',
        'testimonials',
        'skills',
        'experience',
        'education',
        'certifications',
        'articles',
        'contact',
      ].map((key) => ({ key, enabled: true })),
      seoTitle: 'Manoj Khatri — Full-stack developer',
      seoDescription:
        'Full-stack developer working with React.js, Next.js, Node.js, NestJS, GraphQL, .NET and AWS.',
      siteUrl: 'https://www.manoj-khatri.com.np',
      profileImageId,
    },
  });
}

async function seedProjects() {
  // Titles are taken from each site's domain; summaries and bodies are left
  // for the owner to write rather than invented here.
  const projects = [
    [
      'gaikhura-travels',
      'Gaikhura Travels',
      'https://www.gaikhuratravels.com/',
      'Screenshot_2025-06-26_at_12.29.46_AM.png',
    ],
    [
      'equip-bid',
      'Equip-Bid',
      'https://equip-bid.vercel.app/',
      'Screenshot_2025-06-26_at_12.31.35_AM.png',
    ],
    [
      'policy-powerhouse',
      'Policy Powerhouse',
      'https://policypowerhouse.com/holiday-let-insurance/',
      'Screenshot_2025-06-26_at_12.33.27_AM.png',
    ],
    [
      'flextech-design',
      'Flextech Design',
      'https://www.flextechdesign.com/',
      'Screenshot_2025-06-26_at_12.38.22_AM.png',
    ],
  ] as const;

  for (const [
    index,
    [slug, title, liveUrl, screenshot],
  ] of projects.entries()) {
    const thumbnailId = await externalImage(
      `https://d1m1s6un1a8qgj.cloudfront.net/media/portfolio_item_image/${screenshot}`,
      `${title} homepage screenshot`,
    );
    await prisma.project.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        title,
        liveUrl,
        thumbnailId,
        sortOrder: index,
        featured: true,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }
}

async function seedSkills() {
  const groups: [string, string, string[]][] = [
    [
      'frontend',
      'Front-End',
      [
        'HTML',
        'CSS',
        'JavaScript',
        'React.js',
        'Next.js',
        'Vue.js',
        'Tailwind CSS',
        'Bootstrap',
        'Material-UI',
        'Responsive Design',
        'UI/UX Design',
      ],
    ],
    [
      'backend',
      'Back-End',
      [
        'Node.js',
        'Express.js',
        'GraphQL',
        'RESTful APIs',
        '.NET',
        'C#',
        'Database Integration',
        'Server-Side Development',
      ],
    ],
    [
      'tools',
      'Collaboration & Tools',
      ['Notion', 'Slack', 'Figma', 'Sketch', 'Mailchimp'],
    ],
    [
      'soft-skills',
      'Soft Skills',
      [
        'Strong communication',
        'Problem-solving',
        'Attention to detail',
        'Time management',
      ],
    ],
  ];
  for (const [catIndex, [slug, name, skills]] of groups.entries()) {
    const category = await prisma.skillCategory.upsert({
      where: { slug },
      update: {},
      create: { slug, name, sortOrder: catIndex },
    });
    for (const [index, skillName] of skills.entries()) {
      const skillSlug = skillName
        .toLowerCase()
        .replace(/#/g, '-sharp')
        .replace(/\+/g, 'plus')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      await prisma.skill.upsert({
        where: { slug: skillSlug || `skill-${catIndex}-${index}` },
        update: {},
        create: {
          slug: skillSlug || `skill-${catIndex}-${index}`,
          name: skillName,
          categoryId: category.id,
          sortOrder: index,
          status: ContentStatus.PUBLISHED,
        },
      });
    }
  }
}

async function seedExperience() {
  if (await prisma.experience.count()) return;
  const rows: (Omit<Prisma.ExperienceUncheckedCreateInput, 'logoId'> & {
    logo: string;
  })[] = [
    {
      company: 'Aeritech LLC',
      role: 'Senior Software Developer',
      startDate: new Date('2023-05-01'),
      isCurrent: true,
      responsibilities: [
        'Version upgrading and code refactoring using best practices',
        'Developing new features by collaborating with the Clients',
        'Working on bidding sites and mobile apps on both frontend and backend',
      ],
      logo: 'https://media.licdn.com/dms/image/v2/C4E0BAQF2DCBXgX7OnQ/company-logo_100_100/company-logo_100_100/0/1630609448998?e=1763596800&v=beta&t=84jAxIeVi5jygLVk7q8K5SH5PoSEU55jdPKNmJXEabc',
    },
    {
      company: 'Vesuvio Labs',
      role: 'Frontend Engineer',
      startDate: new Date('2021-12-01'),
      endDate: new Date('2023-03-31'),
      responsibilities: [
        'Wireframing the design by consulting with clients for both user journey and backOffice dashboards in figma',
        'Converting the design into clean code using bootstrap and react js flows',
        'Implementing frontend best practices, refactoring old codes',
        'Worked on the insurance sites and dashboards',
      ],
      logo: 'https://media.licdn.com/dms/image/v2/C4D0BAQFRuifaqVCAog/company-logo_100_100/company-logo_100_100/0/1630492369958/labsvesuvio_logo?e=1763596800&v=beta&t=r7fO2h8U8XVns-TYsVtrWw0bFJCX1CG8KyRTMYrYTHk',
    },
    {
      company: 'Medicos International',
      role: 'React Developer',
      // Copied as written on the original page ("May 2011 - Dec 2021"); verify in the admin.
      startDate: new Date('2011-05-01'),
      endDate: new Date('2021-12-31'),
      responsibilities: [
        'Planning features regarding projects and research in various web development practices',
        'Learn and gain expertise on various tools for performance and security',
        'Converting figma wireframes into high quality code based on react js workflows',
        'Worked on the medical pdf site used by medical students for learning',
      ],
      logo: 'https://media.licdn.com/dms/image/v2/C560BAQGe1SJezsZOUQ/company-logo_100_100/company-logo_100_100/0/1630668787104/medicosnpl_logo?e=1763596800&v=beta&t=RaIcdYpnkLHad9GvgJSnhLkECrSyhgAcCSRszoULVYA',
    },
  ];
  for (const [index, { logo, ...row }] of rows.entries()) {
    const logoId = await externalImage(logo, `${row.company} logo`);
    await prisma.experience.create({
      data: {
        ...row,
        logoId,
        sortOrder: index,
        status: ContentStatus.PUBLISHED,
      },
    });
  }
}

async function seedEducation() {
  if (await prisma.credential.count()) return;
  const rows = [
    {
      institution: 'Kantipur Engineering College',
      title: "Bachelor's degree in Computer Software Engineering",
      location: 'Kathmandu, Nepal',
      startDate: new Date('2016-01-01'),
      endDate: new Date('2020-12-31'),
      logo: 'https://kec.edu.np/wp-content/uploads/2024/06/KEC-College-logo-2-1.png',
    },
    {
      institution: 'Adarsh Higher Secondary College',
      title: '+2 Science',
      startDate: new Date('2013-01-01'),
      endDate: new Date('2015-12-31'),
      logo: 'https://wms.edigitalnepal.com/wms/files/ws-profile/1706026903084_997fc06b-a245-473c-a21f-7d2d1eaa2732.png',
    },
    {
      institution: 'Golden ABC Academy',
      title: 'SLC',
      location: 'Nepalgunj, Banke',
      startDate: new Date('2009-01-01'),
      endDate: new Date('2013-12-31'),
      logo: 'https://media.edusanjal.com/__sized__/logos/481013630_1365081934666013_4508007565349060233_n-thumbnail-200x200-70.jpg',
    },
  ];
  for (const [index, { logo, ...row }] of rows.entries()) {
    const logoId = await externalImage(logo, `${row.institution} logo`);
    await prisma.credential.create({
      data: {
        ...row,
        kind: CredentialKind.EDUCATION,
        logoId,
        sortOrder: index,
        status: ContentStatus.PUBLISHED,
      },
    });
  }
}

async function seedTestimonials() {
  if (await prisma.testimonial.count()) return;
  // These came from the Preline template, not real clients, so they start as
  // drafts and stay off the public site until replaced or deleted.
  const rows = [
    {
      quote:
        "I'm absolutely floored by the level of care and attention to detail Manoj has put into this project and for one can guarantee that we will be a return customer.",
      authorName: 'Josh Grazioso',
    },
    {
      quote:
        'To say that hiring Manoj has been life-changing is an understatement. My business has tripled and I got my life back.',
      authorName: 'Nicole Grazioso',
    },
  ];
  for (const [index, row] of rows.entries()) {
    await prisma.testimonial.create({
      data: { ...row, sortOrder: index, status: ContentStatus.DRAFT },
    });
  }
}

async function seedArticles() {
  // The original page listed these titles with no article behind them, so
  // they are seeded as drafts for the owner to write.
  const articles = [
    [
      'the-complete-guide-to-react-hooks',
      'The complete guide to React Hooks',
      'How to clearly understand and visualize react hooks.',
      ['react'],
    ],
    [
      'understanding-authentication-and-authorization',
      'Understanding Authentication and Authorization in Web Development',
      'A comprehensive guide to authentication and authorization mechanisms in web applications.',
      ['security', 'web'],
    ],
    [
      'clean-coding-architecture',
      'Clean Coding Architecture',
      'Best practices and principles for writing clean, maintainable, and scalable code in software development.',
      ['architecture'],
    ],
  ] as const;
  for (const [slug, title, excerpt, tags] of articles) {
    await prisma.article.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        title,
        excerpt,
        tags: [...tags],
        status: ContentStatus.DRAFT,
      },
    });
  }
}

async function main() {
  await seedSettings();
  await seedProjects();
  await seedSkills();
  await seedExperience();
  await seedEducation();
  await seedTestimonials();
  await seedArticles();
  console.log('Seed complete');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
