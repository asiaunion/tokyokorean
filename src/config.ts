/** LinkedIn / X for About, Person JSON-LD `sameAs`, and header social links. Replace with your live URLs. */
export const PUBLIC_PROFILES = {
  linkedIn: "https://www.linkedin.com/in/seungju-kim-3b3629260/?skipRedirect=true",
  x: "https://x.com/asiaunion",
} as const;

export const SITE = {
  website: "https://tokyokorean.net/", // replace this with your deployed domain
  author: "Joseph",
  profile: "https://tokyokorean.net/",
  desc: "일본 거주 8년차 한국인이 전하는 일본 생활, 문화, 도쿄 로컬 이야기",
  title: "Tokyo Korean Life",
  ogImage: "gsf-og-default.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 60 * 1000, // 15 hours
  showArchives: true,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: false,
    text: "Edit page",
    url: "https://github.com/asiaunion/GSF-Blog/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "ko", // Keep aligned with astro.config defaultLocale to avoid mixed language signals.
  timezone: "Asia/Tokyo", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;
