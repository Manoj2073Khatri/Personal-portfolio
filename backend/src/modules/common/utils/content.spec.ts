import { BadRequestException } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import {
  assertDateRange,
  definedOnly,
  nextPreviousSlugs,
  readingTimeMinutes,
  resolvePublishedAt,
  slugify,
  SLUG_PATTERN,
} from './content';

describe('slugify', () => {
  it.each([
    ['Hello World', 'hello-world'],
    ['  Clean Coding Architecture! ', 'clean-coding-architecture'],
    ['Café & Crème', 'cafe-creme'],
    ['React.js / Next.js', 'react-js-next-js'],
  ])('%s → %s', (input, expected) => {
    expect(slugify(input)).toBe(expected);
    expect(SLUG_PATTERN.test(expected)).toBe(true);
  });

  it('limits length to 80 characters without a trailing hyphen', () => {
    const slug = slugify('word '.repeat(40));
    expect(slug.length).toBeLessThanOrEqual(80);
    expect(slug.endsWith('-')).toBe(false);
  });

  it('rejects input with no usable characters', () => {
    expect(() => slugify('!!!')).toThrow(BadRequestException);
  });
});

describe('readingTimeMinutes', () => {
  it('is at least one minute', () => {
    expect(readingTimeMinutes('')).toBe(1);
  });

  it('counts roughly 220 words per minute and ignores code blocks', () => {
    const prose = 'word '.repeat(660);
    const code = '```\n' + 'token '.repeat(1000) + '\n```';
    expect(readingTimeMinutes(prose)).toBe(3);
    expect(readingTimeMinutes(prose + code)).toBe(3);
  });
});

describe('resolvePublishedAt', () => {
  const earlier = new Date('2024-01-01');

  it('stamps the first publish', () => {
    expect(resolvePublishedAt(ContentStatus.PUBLISHED, null)).toBeInstanceOf(
      Date,
    );
  });

  it('keeps the original date on later edits', () => {
    expect(
      resolvePublishedAt(ContentStatus.PUBLISHED, earlier),
    ).toBeUndefined();
  });

  it('leaves drafts alone', () => {
    expect(resolvePublishedAt(ContentStatus.DRAFT, null)).toBeUndefined();
  });

  it('honours an explicit date, including null', () => {
    const scheduled = new Date('2030-01-01');
    expect(
      resolvePublishedAt(ContentStatus.PUBLISHED, earlier, scheduled),
    ).toBe(scheduled);
    expect(resolvePublishedAt(ContentStatus.DRAFT, earlier, null)).toBeNull();
  });
});

describe('nextPreviousSlugs', () => {
  const published = {
    slug: 'old',
    publishedAt: new Date(),
    previousSlugs: [] as string[],
  };

  it('returns undefined when the slug is unchanged or omitted', () => {
    expect(nextPreviousSlugs(published, undefined)).toBeUndefined();
    expect(nextPreviousSlugs(published, 'old')).toBeUndefined();
  });

  it('remembers the old slug of published content', () => {
    expect(nextPreviousSlugs(published, 'new')).toEqual(['old']);
  });

  it('does not keep slugs of never-published drafts', () => {
    expect(
      nextPreviousSlugs({ ...published, publishedAt: null }, 'new'),
    ).toEqual([]);
  });

  it('drops the new slug from history when renaming back', () => {
    expect(
      nextPreviousSlugs(
        { slug: 'b', publishedAt: new Date(), previousSlugs: ['a'] },
        'a',
      ),
    ).toEqual(['b']);
  });
});

describe('helpers', () => {
  it('definedOnly removes undefined but keeps null', () => {
    expect(definedOnly({ a: 1, b: undefined, c: null })).toEqual({
      a: 1,
      c: null,
    });
  });

  it('assertDateRange rejects end before start', () => {
    expect(() =>
      assertDateRange(new Date('2024-02-01'), new Date('2024-01-01')),
    ).toThrow(BadRequestException);
    expect(() => assertDateRange(new Date('2024-01-01'), null)).not.toThrow();
  });
});
