import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { SITE } from "@/config";
import { urlsFromCiteSources } from "@/lib/sourceCitations";

export const BLOG_PATH = "src/data/blog";

const toDomain = (value: string): string | null => {
  try {
    return new URL(value).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
};

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const requireSourcesForPost =
  process.env.CONTENT_INTEGRITY_REQUIRE_SOURCES === "true";
const minSourceCount = parsePositiveInt(
  process.env.CONTENT_INTEGRITY_MIN_SOURCES,
  1
);

/** Keep loader pattern simple to avoid brace-expansion duplicate matches in some environments. */
const blog = defineCollection({
  loader: glob({ pattern: "*/*.{md,mdx}", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(SITE.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
      aiModel: z.string().optional(),
      lang: z.enum(["en", "ko", "ja"]).default("en"),
      /** Post category: top PostDisclaimer copy (investment / safety / general) */
      category: z
        .enum(["investment", "safety", "life", "local", "essay"])
        .optional(),
      macroMicroMatrix: z
        .object({
          leftTitle: z.string(),
          leftItems: z.array(z.string()),
          rightTitle: z.string(),
          rightItems: z.array(z.string()),
        })
        .optional(),
      sources: z.array(z.string().url()).default([]),
      references: z.array(z.string().url()).default([]),
      /** Numbered footnotes → SourcesList #source-N (optional; pilot on trust-heavy posts) */
      citeSources: z
        .array(
          z.object({
            label: z.string(),
            url: z.string().url(),
            archive: z.string().optional(),
            portal: z.string().url().optional(),
            secondaryUrl: z.string().url().optional(),
          })
        )
        .optional(),
    }).superRefine((data, ctx) => {
      if (data.citeSources?.length) {
        for (const url of urlsFromCiteSources(data.citeSources)) {
          if (!data.sources.includes(url)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["sources"],
              message: `citeSources URL must also appear in sources: ${url}`,
            });
            break;
          }
        }
      }

      const sourceSet = new Set(data.sources);

      for (const reference of data.references) {
        if (!sourceSet.has(reference)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["references"],
            message:
              "All references must be included in `sources` (reference subset validation failed).",
          });
          break;
        }
      }

      const uniqueSourceDomains = new Set(
        data.sources.map(toDomain).filter((domain): domain is string => Boolean(domain))
      );

      if (data.sources.length > 0 && uniqueSourceDomains.size < minSourceCount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sources"],
          message: `At least ${minSourceCount} unique source domains are required when sources are provided.`,
        });
      }

      if (!data.draft && requireSourcesForPost) {
        if (data.sources.length < minSourceCount) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["sources"],
            message: `This post requires at least ${minSourceCount} sources (CONTENT_INTEGRITY_REQUIRE_SOURCES=true).`,
          });
        }
      }
    }),
});

const about = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/data/about" }),
  schema: z.object({
    lang: z.enum(["en", "ko", "ja"]),
    title: z.string(),
    /** Public profile URLs for Person JSON-LD (LinkedIn, X, etc.) */
    sameAs: z.array(z.string().url()).optional().default([]),
  }),
});

const privacy = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/data/privacy" }),
  schema: z.object({
    lang: z.enum(["en", "ko", "ja"]),
    title: z.string(),
  }),
});

const contact = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/data/contact" }),
  schema: z.object({
    lang: z.enum(["en", "ko", "ja"]),
    title: z.string(),
  }),
});

const resources = defineCollection({
  loader: glob({
    pattern: "tokyo-relocation-d90/*.md",
    base: "./src/data/resources",
  }),
  schema: z.object({
    lang: z.enum(["en", "ko", "ja"]),
    title: z.string(),
    description: z.string(),
    downloadBasename: z.string(),
  }),
});

export const collections = { blog, about, privacy, contact, resources };
