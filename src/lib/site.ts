export const SITE = {
  name: "Sergei Garcia",
  title: "Sergei Garcia · Designer by eye, teacher by habit, engineer by trade",
  description:
    "Sergei Garcia, software engineer. Designer by eye, teacher by habit, engineer by trade: fast, accessible websites, developer tools and AI workflows.",
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
 * Band colors for Writing and About (picked by Sergei, 2026-10-13). Writing (its index page, every
 * post head and the home Writing section) is cobalt; About takes the other color, yellow. Work stays
 * yellow and Projects stay cobalt. To swap them, change WRITING_BAND; About follows.
 */
export type SectionBand = "yellow" | "cobalt";
export const WRITING_BAND = "cobalt" as SectionBand;
export const ABOUT_BAND: SectionBand = WRITING_BAND === "yellow" ? "cobalt" : "yellow";
