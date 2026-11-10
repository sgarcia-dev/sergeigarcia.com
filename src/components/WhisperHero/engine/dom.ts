export const SVGNS = "http://www.w3.org/2000/svg";

/** Make an element with a class and optional inner HTML. */
export function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls = "", html = ""): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

export function q<T extends Element = HTMLElement>(root: ParentNode, sel: string): T {
  return root.querySelector(sel) as T;
}

export function qa<T extends Element = SVGElement>(root: ParentNode, sel: string): T[] {
  return Array.from(root.querySelectorAll(sel)) as T[];
}

export const attr = (e: Element, name: string, v: string | number) => e.setAttribute(name, String(v));
