/**
 * Response shapes of the CMS API. These mirror the backend DTOs in
 * backend/src/modules/<module>/dto/*.dto.ts (see backend/docs/api-contracts.md).
 * Dates arrive as ISO strings.
 */

export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type MediaKind = "IMAGE" | "DOCUMENT";
export type MediaStatus = "PENDING" | "READY";
export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "FREELANCE" | "INTERNSHIP";
export type CredentialKind = "EDUCATION" | "CERTIFICATION";
export type SubmissionStatus = "NEW" | "READ" | "ARCHIVED";

export type HomepageSectionKey =
  | "projects"
  | "testimonials"
  | "skills"
  | "experience"
  | "education"
  | "certifications"
  | "articles"
  | "contact";

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

export interface MediaRef {
  id: string;
  kind: MediaKind;
  url: string;
  alt: string;
  mimeType: string;
  width: number | null;
  height: number | null;
}

export interface Media extends MediaRef {
  status: MediaStatus;
  filename: string;
  size: number | null;
  external: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SocialLink {
  platform: "github" | "linkedin" | "x" | "email" | "website" | "dribbble" | "youtube" | "other";
  label: string;
  url: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface HomepageSection {
  key: HomepageSectionKey;
  enabled: boolean;
}

export interface SiteSettings {
  name: string;
  title: string;
  intro: string;
  bio: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  resumeUrl: string | null;
  socialLinks: SocialLink[];
  navigation: NavLink[];
  footerText: string;
  homepageSections: HomepageSection[];
  seoTitle: string | null;
  seoDescription: string | null;
  siteUrl: string | null;
  profileImage: MediaRef | null;
  resumeMedia: MediaRef | null;
  ogImage: MediaRef | null;
  updatedAt: string | null;
}

export interface SkillRef {
  id: string;
  name: string;
  slug: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  skillCount?: number;
}

export interface Skill extends SkillRef {
  proficiency: string | null;
  sortOrder: number;
  status: ContentStatus;
  category: SkillCategory;
  icon: MediaRef | null;
  updatedAt: string;
}

export interface PublicSkillGroup {
  category: SkillCategory;
  skills: (SkillRef & { proficiency: string | null; sortOrder: number; icon: MediaRef | null })[];
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  role: string | null;
  liveUrl: string | null;
  repoUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  featured: boolean;
  sortOrder: number;
  status: ContentStatus;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  thumbnail: MediaRef | null;
  ogImage: MediaRef | null;
  gallery: MediaRef[];
  skills: SkillRef[];
  createdAt: string;
  updatedAt: string;
}

export type PublicProject = Omit<Project, "status" | "createdAt">;

export interface ArticleSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  readingTimeMinutes: number;
  publishedAt: string | null;
  coverImage: MediaRef | null;
  updatedAt: string;
}

export interface PublicArticle extends ArticleSummary {
  body: string;
  seoTitle: string | null;
  seoDescription: string | null;
  /** Original URL when cross-posted; used as rel=canonical. */
  canonicalUrl: string | null;
  noIndex: boolean;
  ogImage: MediaRef | null;
  author: { name: string | null };
}

export interface Article extends PublicArticle {
  status: ContentStatus;
  createdAt: string;
}

export interface Experience {
  id: string;
  company: string;
  companyUrl: string | null;
  role: string;
  employmentType: EmploymentType;
  location: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  summary: string;
  responsibilities: string[];
  achievements: string[];
  skills: SkillRef[];
  logo: MediaRef | null;
  sortOrder: number;
  status: ContentStatus;
  updatedAt: string;
}

export interface Credential {
  id: string;
  kind: CredentialKind;
  institution: string;
  title: string;
  field: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  credentialUrl: string | null;
  credentialId: string | null;
  description: string;
  logo: MediaRef | null;
  sortOrder: number;
  status: ContentStatus;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  authorName: string;
  authorTitle: string | null;
  authorCompany: string | null;
  avatar: MediaRef | null;
  sortOrder: number;
  status: ContentStatus;
  updatedAt: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  status: SubmissionStatus;
  userAgent: string | null;
  createdAt: string;
}

export interface HomeData {
  settings: SiteSettings;
  projects: PublicProject[];
  totalProjects: number;
  articles: ArticleSummary[];
  totalArticles: number;
  skills: PublicSkillGroup[];
  experience: Omit<Experience, "status">[];
  education: Omit<Credential, "status">[];
  certifications: Omit<Credential, "status">[];
  testimonials: Omit<Testimonial, "status">[];
}

export interface SitemapData {
  siteUpdatedAt: string | null;
  projects: { slug: string; updatedAt: string }[];
  articles: { slug: string; updatedAt: string }[];
}

type Counts = { total: number; DRAFT: number; PUBLISHED: number; ARCHIVED: number };

export interface DashboardStats {
  projects: Counts;
  articles: Counts;
  skills: Counts;
  experiences: Counts;
  credentials: Counts;
  testimonials: Counts;
  media: number;
  newSubmissions: number;
  recentlyUpdated: { id: string; type: "project" | "article"; title: string; status: ContentStatus; updatedAt: string }[];
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
}

/** Error body produced by the backend's validation pipe and exception filters. */
export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
  errors?: Record<string, string[]>;
}
