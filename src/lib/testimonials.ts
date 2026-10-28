/**
 * Quotes from Sergei's LinkedIn recommendations (picked by Sergei, 2026-10-28).
 *
 * The words are the recommenders' own. Allowed edits only: "…" where text was cut, two typo fixes
 * ("when in comes" to "when it comes", "Sergie" to "Sergei"). Raul's is
 * translated from Spanish. Titles are their current ones, as Sergei gave them. No photos.
 *
 * `short` is the line used on the home page; `full` is the longer quote on the About page.
 * Write `==phrase==` to highlight a phrase (rendered by markHtml in src/lib/mark.ts).
 */
export interface Testimonial {
  name: string;
  /** Their current role, as one line. */
  title: string;
  /** How they know Sergei, from the LinkedIn recommendation label. */
  relation: string;
  year: number;
  short?: string;
  full: string;
  /** Set when the quote is a translation. */
  translatedFrom?: string;
}

export const RECOMMENDATIONS_URL = "https://www.linkedin.com/in/sergeigarcia/details/recommendations/";

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Daniel Merriman",
    title: "Product Lead, Government Digital Service (UK)",
    relation: "Managed Sergei at Teaching.com",
    year: 2023,
    short:
      "I've met few engineers who've had that invaluable knack of making the people around them better, but Sergei is one of them. When we talk about ==10x engineers==, that's what we really mean…",
    full:
      "I've met few engineers who've had that invaluable knack of making the people around them better, but Sergei is one of them. When we talk about ==10x engineers==, that's what we really mean: engineers who are not just outstandingly excellent in their technical capabilities (and let me be clear - when it comes to React, there aren't many better than Sergei) but engineers whose communication, mentoring, and collaboration skills give everyone else on their team a boost. … I would re-hire Sergei in an instant.",
  },
  {
    name: "Juan Pablo Lozano Gómez",
    title: "Staff Software Engineer, Reddit",
    relation: "Managed Sergei at Reddit",
    year: 2026,
    short:
      "…he proved to be ==one of the best FE engineers I've ever worked with==, and a very proactive and knowledge hungry person.",
    full:
      "He started as a contractor that I personally interviewed and then recommended to my EMs. During that contractor time he proved to be ==one of the best FE engineers I've ever worked with==, and a very proactive and knowledge hungry person. … Sergei is an amazing human being, a great developer and engineer, ==an AI wizard== (really, he built an entire curriculum to teach it here), and someone I will genuinely miss working with.",
  },
  {
    name: "Bryan Spearman",
    title: "Web Developer III, BlueCross BlueShield of South Carolina",
    relation: "Mentored by Sergei at Thinkful",
    year: 2019,
    short: "This man is ==THE best mentor I've ever had== and I'm probably 20 years his senior.",
    full:
      "This man is ==THE best mentor I've ever had== and I'm probably 20 years his senior. He is extremely well organized, insightful, thoughtful, kind, polite, punctual and above all, an unbelievably talented web developer.",
  },
  {
    name: "Raul Salazar",
    title: "Senior Product Designer, Teletrac Navman",
    relation: "Worked with Sergei on a different team",
    year: 2017,
    full: "Sergei is ==one of the best Front End Developers I have worked with==. He takes initiative, he is creative and meticulous, and he proposes solutions.",
    translatedFrom: "Spanish",
  },
  {
    name: "Lesley Dreyer",
    title: "Junior Software Engineer, Terascope",
    relation: "Mentored by Sergei",
    year: 2019,
    full:
      "A Javascript ninja whose personality lights up the room! … He mentored me off and on the past year in my quest to switch careers to software development and is ==hands down one of the best teachers== I've ever had.",
  },
];
