import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ContentStatus, SubmissionStatus } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

class StatusCounts {
  @ApiProperty() total: number;
  @ApiProperty() DRAFT: number;
  @ApiProperty() PUBLISHED: number;
  @ApiProperty() ARCHIVED: number;
}

class RecentItem {
  @ApiProperty() id: string;
  @ApiProperty() type: string;
  @ApiProperty() title: string;
  @ApiProperty({ enum: ContentStatus }) status: ContentStatus;
  @ApiProperty() updatedAt: Date;
}

export class StatsResponse {
  @ApiProperty({ type: StatusCounts }) projects: StatusCounts;
  @ApiProperty({ type: StatusCounts }) articles: StatusCounts;
  @ApiProperty({ type: StatusCounts }) skills: StatusCounts;
  @ApiProperty({ type: StatusCounts }) experiences: StatusCounts;
  @ApiProperty({ type: StatusCounts }) credentials: StatusCounts;
  @ApiProperty({ type: StatusCounts }) testimonials: StatusCounts;
  @ApiProperty() media: number;
  @ApiProperty() newSubmissions: number;
  @ApiProperty({ type: [RecentItem] }) recentlyUpdated: RecentItem[];
}

type GroupRow = { status: ContentStatus; _count: { _all: number } };

function toCounts(rows: GroupRow[]): StatusCounts {
  const counts: StatusCounts = {
    total: 0,
    DRAFT: 0,
    PUBLISHED: 0,
    ARCHIVED: 0,
  };
  for (const row of rows) {
    counts[row.status] = row._count._all;
    counts.total += row._count._all;
  }
  return counts;
}

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async stats(): Promise<StatsResponse> {
    const by = {
      by: ['status'] as ['status'],
      _count: { _all: true } as const,
    };
    const recentSelect = {
      id: true,
      title: true,
      status: true,
      updatedAt: true,
    } as const;
    const [
      projects,
      articles,
      skills,
      experiences,
      credentials,
      testimonials,
      media,
      newSubmissions,
      recentProjects,
      recentArticles,
    ] = await Promise.all([
      this.prisma.project.groupBy(by),
      this.prisma.article.groupBy(by),
      this.prisma.skill.groupBy(by),
      this.prisma.experience.groupBy(by),
      this.prisma.credential.groupBy(by),
      this.prisma.testimonial.groupBy(by),
      this.prisma.media.count({ where: { status: 'READY' } }),
      this.prisma.contactSubmission.count({
        where: { status: SubmissionStatus.NEW },
      }),
      this.prisma.project.findMany({
        select: recentSelect,
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
      this.prisma.article.findMany({
        select: recentSelect,
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      projects: toCounts(projects),
      articles: toCounts(articles),
      skills: toCounts(skills),
      experiences: toCounts(experiences),
      credentials: toCounts(credentials),
      testimonials: toCounts(testimonials),
      media,
      newSubmissions,
      recentlyUpdated: [
        ...recentProjects.map((p) => ({ ...p, type: 'project' })),
        ...recentArticles.map((a) => ({ ...a, type: 'article' })),
      ]
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 6),
    };
  }
}
