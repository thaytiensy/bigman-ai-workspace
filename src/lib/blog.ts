import fs from "node:fs";
import path from "node:path";
import { BRAND_CONFIG } from "@/config/brand";

export const HERO_IMAGE = {
  src: "/images/hero-to-chuc-nhan-vien-ai.jpg",
  width: 1376,
  height: 768,
  alt: "Tổ Chức Nhân Viên AI — Đội ngũ nhân sự AI đa bot phối hợp liên phòng ban 24/7",
} as const;

export interface BlogFaqItem {
  question: string;
  answer: string;
}

export interface BlogContact {
  zalo: string;
  zaloUrl: string;
  email: string;
}

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface ListItemNode {
  text: string;
  quote?: string;
  children?: ListItemNode[];
}

export type MarkdownBlock =
  | { type: "heading"; level: 2 | 3; text: string; id: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: ListItemNode[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "code"; language: string; content: string }
  | { type: "blockquote"; lines: string[] }
  | { type: "hr" };

export interface BlogPost {
  order: number;
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  category: string;
  date: string;
  author: string;
  contact: BlogContact;
  faq: BlogFaqItem[];
  readingTimeMinutes: number;
  toc: TocItem[];
  blocks: MarkdownBlock[];
  coverImage: string;
  coverImageWidth: number;
  coverImageHeight: number;
}

const BLOG_CONTENT_DIR = path.join(process.cwd(), "content", "blog");

function unquoteYaml(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    const inner = trimmed.slice(1, -1);
    return trimmed.startsWith('"')
      ? inner.replace(/\\"/g, '"').replace(/\\\\/g, "\\")
      : inner.replace(/''/g, "'");
  }
  return trimmed;
}

function slugifyHeading(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

interface ParsedFrontmatter {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  category: string;
  date: string;
  author: string;
  coverImage: string;
  contact: BlogContact;
  faq: BlogFaqItem[];
}

function parseFrontmatter(rawFrontmatter: string): ParsedFrontmatter {
  const lines = rawFrontmatter.split(/\r?\n/);

  const result: ParsedFrontmatter = {
    title: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
    keywords: [],
    category: "Kiến thức AI",
    date: "2026-11-22",
    author: BRAND_CONFIG.name,
    coverImage: HERO_IMAGE.src,
    contact: {
      zalo: BRAND_CONFIG.contact.zaloPhone,
      zaloUrl: BRAND_CONFIG.contact.zaloUrl,
      email: BRAND_CONFIG.contact.email,
    },
    faq: [],
  };

  let currentSection: "none" | "keywords" | "contact" | "faq" = "none";
  let currentFaq: Partial<BlogFaqItem> | null = null;

  for (const rawLine of lines) {
    if (!rawLine.trim()) continue;

    // Top-level key: value
    const topMatch = rawLine.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (topMatch) {
      if (currentFaq && currentFaq.question && currentFaq.answer) {
        result.faq.push({
          question: currentFaq.question,
          answer: currentFaq.answer,
        });
        currentFaq = null;
      }

      const key = topMatch[1];
      const val = topMatch[2].trim();

      if (key === "keywords") {
        currentSection = "keywords";
        continue;
      }
      if (key === "contact") {
        currentSection = "contact";
        continue;
      }
      if (key === "faq") {
        currentSection = "faq";
        continue;
      }

      currentSection = "none";
      const parsedVal = unquoteYaml(val);
      switch (key) {
        case "title":
          result.title = parsedVal;
          break;
        case "slug":
          result.slug = parsedVal;
          break;
        case "metaTitle":
          result.metaTitle = parsedVal;
          break;
        case "metaDescription":
          result.metaDescription = parsedVal;
          break;
        case "category":
          result.category = parsedVal;
          break;
        case "date":
          result.date = parsedVal;
          break;
        case "author":
          result.author = parsedVal;
          break;
        case "coverImage":
          if (parsedVal) result.coverImage = parsedVal;
          break;
      }
      continue;
    }

    if (currentSection === "keywords") {
      const kwMatch = rawLine.match(/^\s*-\s+(.+)$/);
      if (kwMatch) {
        result.keywords.push(unquoteYaml(kwMatch[1]));
      }
      continue;
    }

    if (currentSection === "contact") {
      const contactMatch = rawLine.match(/^\s+([a-zA-Z0-9_]+):\s*(.+)$/);
      if (contactMatch) {
        const cKey = contactMatch[1];
        const cVal = unquoteYaml(contactMatch[2]);
        if (cKey === "zalo") result.contact.zalo = cVal;
        if (cKey === "zaloUrl") result.contact.zaloUrl = cVal;
        if (cKey === "email") result.contact.email = cVal;
      }
      continue;
    }

    if (currentSection === "faq") {
      const faqStart = rawLine.match(/^\s*-\s+([a-zA-Z0-9_]+):\s*(.+)$/);
      if (faqStart) {
        if (currentFaq && currentFaq.question && currentFaq.answer) {
          result.faq.push({
            question: currentFaq.question,
            answer: currentFaq.answer,
          });
        }
        currentFaq = {};
        const fKey = faqStart[1];
        const fVal = unquoteYaml(faqStart[2]);
        if (fKey === "question") currentFaq.question = fVal;
        if (fKey === "answer") currentFaq.answer = fVal;
        continue;
      }

      const faqProp = rawLine.match(/^\s+([a-zA-Z0-9_]+):\s*(.+)$/);
      if (faqProp && currentFaq) {
        const fKey = faqProp[1];
        const fVal = unquoteYaml(faqProp[2]);
        if (fKey === "question") currentFaq.question = fVal;
        if (fKey === "answer") currentFaq.answer = fVal;
      }
    }
  }

  if (currentFaq && currentFaq.question && currentFaq.answer) {
    result.faq.push({
      question: currentFaq.question,
      answer: currentFaq.answer,
    });
  }

  return result;
}

function splitTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

function isTableSeparator(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes("|")) return false;
  const cells = splitTableRow(trimmed);
  return cells.length > 0 && cells.every((c) => /^:?-{3,}:?$/.test(c));
}

function parseMarkdownBody(body: string): { blocks: MarkdownBlock[]; toc: TocItem[] } {
  const lines = body.replace(/\\"/g, '"').split(/\r?\n/);
  const blocks: MarkdownBlock[] = [];
  const toc: TocItem[] = [];
  const usedIds = new Map<string, number>();

  const makeUniqueId = (text: string): string => {
    const base = slugifyHeading(text) || "muc";
    const count = usedIds.get(base) ?? 0;
    usedIds.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };

  let i = 0;
  let skippedFirstH1 = false;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Fenced code block (including ASCII diagrams)
    if (trimmed.startsWith("```")) {
      const language = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++;
      blocks.push({
        type: "code",
        language,
        content: codeLines.join("\n"),
      });
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Headings
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      i++;
      // Skip the first H1 because the page hero renders the article <h1>
      if (level === 1 && !skippedFirstH1) {
        skippedFirstH1 = true;
        continue;
      }
      const normalizedLevel: 2 | 3 = level <= 2 ? 2 : 3;
      const id = makeUniqueId(text);
      toc.push({ id, text, level: normalizedLevel });
      blocks.push({
        type: "heading",
        level: normalizedLevel,
        text,
        id,
      });
      continue;
    }

    // Markdown table
    if (
      trimmed.startsWith("|") &&
      i + 1 < lines.length &&
      isTableSeparator(lines[i + 1])
    ) {
      const headers = splitTableRow(trimmed);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitTableRow(lines[i]));
        i++;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    // Blockquote
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "blockquote", lines: quoteLines });
      continue;
    }

    // Unordered or Ordered List (with nested bullets, continuation lines & quotes)
    const ulMatch = line.match(/^-\s+(.+)$/);
    const olMatch = line.match(/^\d+\.\s+(.+)$/);
    if (ulMatch || olMatch) {
      const ordered = Boolean(olMatch);
      const items: ListItemNode[] = [];

      while (i < lines.length) {
        const cur = lines[i];
        const topItemMatch = ordered
          ? cur.match(/^\d+\.\s+(.+)$/)
          : cur.match(/^-\s+(.+)$/);

        if (topItemMatch) {
          items.push({ text: topItemMatch[1].trim() });
          i++;
          continue;
        }

        // Nested bullet item (indented by 2+ spaces)
        const subBulletMatch = cur.match(/^\s{2,}-\s+(.+)$/);
        if (subBulletMatch && items.length > 0) {
          const parent = items[items.length - 1];
          if (!parent.children) parent.children = [];
          parent.children.push({ text: subBulletMatch[1].trim() });
          i++;
          continue;
        }

        // Indented blockquote inside list item (e.g., testimonial stories)
        const subQuoteMatch = cur.match(/^\s{2,}>\s*(.+)$/);
        if (subQuoteMatch && items.length > 0) {
          const parent = items[items.length - 1];
          parent.quote = parent.quote
            ? `${parent.quote} ${subQuoteMatch[1].trim()}`
            : subQuoteMatch[1].trim();
          i++;
          continue;
        }

        // Indented continuation text belonging to previous item
        const continuationMatch = cur.match(/^\s{2,}(.+)$/);
        if (continuationMatch && items.length > 0) {
          const parent = items[items.length - 1];
          parent.text = `${parent.text}<br>${continuationMatch[1].trim()}`;
          i++;
          continue;
        }

        // Allow a single blank line between list items that carry testimonials
        if (!cur.trim() && i + 1 < lines.length) {
          const next = lines[i + 1];
          const nextIsSameList = ordered
            ? /^\d+\.\s+/.test(next)
            : /^-\s+/.test(next);
          if (nextIsSameList) {
            i++;
            continue;
          }
        }

        break;
      }

      blocks.push({ type: "list", ordered, items });
      continue;
    }

    // Paragraph (join consecutive plain lines)
    const paraLines: string[] = [];
    while (i < lines.length) {
      const cur = lines[i];
      const curTrimmed = cur.trim();
      if (
        !curTrimmed ||
        curTrimmed.startsWith("```") ||
        curTrimmed.startsWith("#") ||
        curTrimmed.startsWith(">") ||
        curTrimmed.startsWith("|") ||
        /^(-{3,}|\*{3,}|_{3,})$/.test(curTrimmed) ||
        /^-\s+/.test(cur) ||
        /^\d+\.\s+/.test(cur)
      ) {
        break;
      }
      paraLines.push(curTrimmed);
      i++;
    }

    if (paraLines.length > 0) {
      blocks.push({ type: "paragraph", text: paraLines.join("<br>") });
    }
  }

  return { blocks, toc };
}

function estimateReadingTime(body: string): number {
  const words = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`|[\]()-]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(3, Math.ceil(words / 220));
}

function parseBlogFile(filePath: string, fileName: string): BlogPost {
  const raw = fs.readFileSync(filePath, "utf8");
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!fmMatch) {
    throw new Error(`Blog file missing valid YAML frontmatter: ${fileName}`);
  }

  const frontmatter = parseFrontmatter(fmMatch[1]);
  const body = fmMatch[2];
  const { blocks, toc } = parseMarkdownBody(body);
  const orderMatch = fileName.match(/pillar-(\d+)/i);
  const order = orderMatch ? Number(orderMatch[1]) : 99;

  const coverImage = frontmatter.coverImage || HERO_IMAGE.src;
  const isOg1200x630 = coverImage.includes("1200x630");

  return {
    order,
    title: frontmatter.title,
    slug: frontmatter.slug || fileName.replace(/\.md$/, ""),
    metaTitle: frontmatter.metaTitle || frontmatter.title,
    metaDescription: frontmatter.metaDescription,
    keywords: frontmatter.keywords,
    category: frontmatter.category,
    date: frontmatter.date,
    author: frontmatter.author,
    contact: frontmatter.contact,
    faq: frontmatter.faq,
    readingTimeMinutes: estimateReadingTime(body),
    toc,
    blocks,
    coverImage,
    coverImageWidth: isOg1200x630 ? 1200 : HERO_IMAGE.width,
    coverImageHeight: isOg1200x630 ? 630 : HERO_IMAGE.height,
  };
}

let cachedPosts: BlogPost[] | null = null;

export function getAllBlogPosts(): BlogPost[] {
  if (cachedPosts) return cachedPosts;
  if (!fs.existsSync(BLOG_CONTENT_DIR)) return [];

  const files = fs
    .readdirSync(BLOG_CONTENT_DIR)
    .filter((file) => file.endsWith(".md"))
    .sort();

  const posts = files
    .map((file) => parseBlogFile(path.join(BLOG_CONTENT_DIR, file), file))
    .sort((a, b) => a.order - b.order);

  cachedPosts = posts;
  return posts;
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return getAllBlogPosts().find((post) => post.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return getAllBlogPosts().map((post) => post.slug);
}

export function formatVietnameseDate(isoDate: string): string {
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}
