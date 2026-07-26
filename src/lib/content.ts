// Generic markdown content loader — globs every .md file under the content
// directories at build time so new files appear without touching import lists.
// Metadata (title, tags, dates, etc.) stays external in content/*.json,
// matching the isrd_legacy-site convention.

const rawFiles = import.meta.glob(
  '../{articles,media,research,publications,courses}/**/*.md',
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>;

// Key by filename (e.g. "systems_science_eras-article.md") so existing
// manifest "file" fields resolve without a directory prefix.
const contentByFile: Record<string, string> = {};
// Also keyed by collection-relative path (e.g. "articles/foo.md") for
// collections that disambiguate by directory.
const contentByPath: Record<string, string> = {};

for (const [vitePath, raw] of Object.entries(rawFiles)) {
  const relPath = vitePath.replace(/^\.\.\//, ''); // "articles/foo.md"
  const fileName = relPath.split('/').pop()!;
  contentByPath[relPath] = raw;
  contentByFile[fileName] = raw;
}

export function getContentByFile(fileName: string): string | null {
  return contentByFile[fileName] ?? null;
}

export function getContentByPath(relPath: string): string | null {
  return contentByPath[relPath] ?? null;
}

export interface TaggedItem {
  slug: string;
  title: string;
  tags: string[];
  collection: string; // e.g. 'articles', 'media', 'research', 'publications'
}

// Related content = items from any collection sharing the most tags,
// ranked by overlap count, excluding the item itself.
export function getRelated<T extends TaggedItem>(
  item: T,
  allItems: T[],
  count = 3,
): T[] {
  return allItems
    .filter(other => other.slug !== item.slug || other.collection !== item.collection)
    .map(other => ({
      other,
      overlap: other.tags.filter(t => item.tags.includes(t)).length,
    }))
    .filter(({ overlap }) => overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, count)
    .map(({ other }) => other);
}
