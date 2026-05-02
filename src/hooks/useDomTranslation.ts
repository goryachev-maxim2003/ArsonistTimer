import { useEffect } from "react";
import { useAppStore } from "../store/appStore";
import { translateText } from "../i18n/text";

const translatedAttributes = ["placeholder", "aria-label", "title"] as const;

function preserveWhitespace(original: string, translated: string) {
  const prefix = original.match(/^\s*/)?.[0] ?? "";
  const suffix = original.match(/\s*$/)?.[0] ?? "";
  return `${prefix}${translated}${suffix}`;
}

function translateElement(element: Element, language: "en" | "ru") {
  if (["SCRIPT", "STYLE", "TEXTAREA"].includes(element.tagName)) return;

  translatedAttributes.forEach((attribute) => {
    const value = element.getAttribute(attribute);
    if (!value) return;
    const translated = translateText(value.trim(), language);
    if (translated !== value.trim()) element.setAttribute(attribute, translated);
  });

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "TEXTAREA", "CODE", "PRE"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);

  nodes.forEach((node) => {
    const original = node.textContent ?? "";
    const translated = translateText(original.trim(), language);
    if (translated !== original.trim()) node.textContent = preserveWhitespace(original, translated);
  });
}

export function useDomTranslation() {
  const language = useAppStore((state) => state.settings.language);

  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;

    translateElement(root, language);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) translateElement(node as Element, language);
          });
        }
        if (mutation.type === "attributes" && mutation.target instanceof Element) translateElement(mutation.target, language);
      });
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [...translatedAttributes],
    });

    return () => observer.disconnect();
  }, [language]);
}
