const BLOCKED_ELEMENTS = new Set([
    "script",
    "style",
    "iframe",
    "object",
    "embed",
    "link",
    "meta",
    "base",
    "svg",
    "math",
]);

const URL_ATTRIBUTES = new Set(["href", "src", "xlink:href", "formaction"]);
const SAFE_URL_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

function isSafeAttributeUrl(value: string): boolean {
    const trimmedValue = value.trim();
    if (trimmedValue.startsWith("#") || trimmedValue.startsWith("/")) {
        return true;
    }

    try {
        const url = new URL(trimmedValue, window.location.origin);
        return SAFE_URL_PROTOCOLS.has(url.protocol);
    } catch {
        return false;
    }
}

function sanitizeAttributes(element: Element): void {
    for (const attribute of Array.from(element.attributes)) {
        const name = attribute.name.toLowerCase();

        if (name.startsWith("on")) {
            element.removeAttribute(attribute.name);
            continue;
        }

        if (URL_ATTRIBUTES.has(name) && !isSafeAttributeUrl(attribute.value)) {
            element.removeAttribute(attribute.name);
            continue;
        }

        if (name === "srcdoc") {
            element.removeAttribute(attribute.name);
        }
    }
}

function stripUnsafeInlineStyles(element: HTMLElement): void {
    element.style.removeProperty("font-size");
    element.style.removeProperty("line-height");

    if (!element.getAttribute("style")) {
        element.removeAttribute("style");
    }
}

export function sanitizeRichTextHtml(html: string): string {
    const document = new DOMParser().parseFromString(html, "text/html");
    const elements = Array.from(document.body.querySelectorAll("*"));

    for (const element of elements) {
        if (BLOCKED_ELEMENTS.has(element.tagName.toLowerCase())) {
            element.remove();
            continue;
        }

        sanitizeAttributes(element);

        if (element instanceof HTMLElement && element.hasAttribute("style")) {
            stripUnsafeInlineStyles(element);
        }

        if (element.tagName.toLowerCase() === "font") {
            element.removeAttribute("size");
        }
    }

    return document.body.innerHTML;
}
