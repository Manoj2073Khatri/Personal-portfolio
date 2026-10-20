import { ArticleList } from "@/components/site/article-list";
import { ContactForm } from "@/components/site/contact-form";
import { CredentialGrid } from "@/components/site/credential-grid";
import { ExperienceTimeline } from "@/components/site/experience-timeline";
import { ProfileIntro } from "@/components/site/profile-intro";
import { ProjectGrid } from "@/components/site/project-grid";
import { PageContainer, Section } from "@/components/site/section";
import { SkillsList } from "@/components/site/skills-list";
import { TestimonialList } from "@/components/site/testimonial-list";
import { getHome } from "@/lib/cms/public-api";
import type { HomeData, HomepageSectionKey } from "@/lib/cms/types";

/** Each homepage section renders only when enabled in settings and it has content. */
const SECTIONS: Record<HomepageSectionKey, (data: HomeData) => React.ReactNode> = {
  projects: (d) =>
    d.projects.length > 0 && (
      <Section
        id="projects"
        title="Projects"
        action={d.totalProjects > d.projects.length ? { href: "/projects", label: "All projects" } : undefined}
      >
        <ProjectGrid projects={d.projects} />
      </Section>
    ),
  testimonials: (d) =>
    d.testimonials.length > 0 && (
      <Section id="testimonials" title="Testimonials">
        <TestimonialList items={d.testimonials} />
      </Section>
    ),
  skills: (d) =>
    d.skills.length > 0 && (
      <Section id="skills" title="Skills">
        <SkillsList groups={d.skills} />
      </Section>
    ),
  experience: (d) =>
    d.experience.length > 0 && (
      <Section id="experience" title="Work experience">
        <ExperienceTimeline items={d.experience} />
      </Section>
    ),
  education: (d) =>
    d.education.length > 0 && (
      <Section id="education" title="Education">
        <CredentialGrid items={d.education} />
      </Section>
    ),
  certifications: (d) =>
    d.certifications.length > 0 && (
      <Section id="certifications" title="Certifications">
        <CredentialGrid items={d.certifications} />
      </Section>
    ),
  articles: (d) =>
    d.articles.length > 0 && (
      <Section
        id="articles"
        title="Articles"
        action={{ href: "/articles", label: d.totalArticles > d.articles.length ? "All articles" : "Read" }}
      >
        <ArticleList articles={d.articles} />
      </Section>
    ),
  contact: () => (
    <Section id="contact" title="Get in touch">
      <ContactForm />
    </Section>
  ),
};

export default async function HomePage() {
  const data = await getHome();
  return (
    <PageContainer>
      <ProfileIntro settings={data.settings} />
      {data.settings.homepageSections
        .filter((s) => s.enabled)
        .map((s) => (
          <div key={s.key}>{SECTIONS[s.key]?.(data)}</div>
        ))}
    </PageContainer>
  );
}
