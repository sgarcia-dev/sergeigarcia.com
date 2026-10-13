export const SITE = {
  name: "Sergei Garcia",
  title: "Sergei Garcia | Senior software engineer",
  description:
    "Sergei Garcia, senior software engineer in Dublin, Ireland. Front end, full stack and AI-assisted development.",
  url: "https://sergeigarcia.com",
  email: "hello@sergeigarcia.com",
  location: "Dublin, Ireland",
  jobTitle: "Senior Software Engineer",
  ogImage: "/og-default.png",
  resume: "/resume/sergei-garcia-resume.pdf",
  links: {
    linkedin: "https://www.linkedin.com/in/sergeigarcia",
    github: "https://github.com/sgarcia-dev",
  },
} as const;

export const NAV = [
  { href: "/work/", label: "Work" },
  { href: "/projects/", label: "Projects" },
  { href: "/writing/", label: "Writing" },
  { href: "/about/", label: "About" },
] as const;

/**
 * Band colors for the two sections the owner is comparing. Build time only: set the env var
 * WRITING_BAND=yellow|cobalt when you run `npm run build` (default yellow). Writing (its index page,
 * every post head and the home Writing section) uses WRITING_BAND; About uses the other one. Work
 * stays yellow and Projects stay cobalt.
 */
export type SectionBand = "yellow" | "cobalt";
const writingEnv = typeof process !== "undefined" ? process.env.WRITING_BAND : undefined;
export const WRITING_BAND: SectionBand = (writingEnv ?? import.meta.env.WRITING_BAND) === "cobalt" ? "cobalt" : "yellow";
export const ABOUT_BAND: SectionBand = WRITING_BAND === "yellow" ? "cobalt" : "yellow";
