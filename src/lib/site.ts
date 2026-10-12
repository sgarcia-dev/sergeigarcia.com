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
