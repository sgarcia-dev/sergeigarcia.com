import { SITE } from "./site";

/*
  Structured data. One Person node with a stable @id, so every
  page can point to the same person instead of repeating the details.
*/
export const PERSON_ID = `${SITE.url}/#person`;

export const PERSON = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": PERSON_ID,
  name: SITE.name,
  url: `${SITE.url}/`,
  jobTitle: SITE.jobTitle,
  description:
    "Software engineer from Mexico, based in Dublin, Ireland. 13+ years building web products with React and TypeScript, plus AI-assisted development and teaching.",
  email: `mailto:${SITE.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Dublin", addressCountry: "IE" },
  nationality: { "@type": "Country", name: "Mexico" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "TecMilenio University" },
  knowsLanguage: ["en", "es"],
  knowsAbout: [
    "Front-end development",
    "React",
    "TypeScript",
    "Full-stack development",
    "Web performance",
    "Accessibility",
    "Localization",
    "AI-assisted software development",
    "AI agents",
    "Developer tooling",
    "Technical mentoring",
  ],
  sameAs: [SITE.links.linkedin, SITE.links.github],
};

/** The author reference used by articles and case studies. */
export const AUTHOR_REF = { "@type": "Person", "@id": PERSON_ID, name: SITE.name, url: `${SITE.url}/` };

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: new URL(item.path, SITE.url).href,
    })),
  };
}
