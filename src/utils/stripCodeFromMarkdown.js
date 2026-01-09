import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";

export function extractSpeakableText(markdown = "") {
  if (!markdown) return "";

  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const chunks = [];

  visit(tree, (node) => {
    if (node.type === "code" || node.type === "table") {
      return visit.SKIP;
    }
    
    if (node.type === "text" || node.type === "inlineCode") {
      chunks.push(node.value);
    }

    if (["heading", "paragraph", "listItem"].includes(node.type)) {
      chunks.push("\n");
    }
  });

  return chunks.join(" ").replace(/\s+/g, " ").replace(/\n\s+/g, "\n").trim();
}

export function getEnglishFemaleVoice() {
  const voices = window.speechSynthesis.getVoices();

  return (
    voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        /female|woman|zira|susan|samantha|victoria|karen/i.test(v.name)
    ) ||
    voices.find((v) => v.lang.startsWith("en")) ||
    null
  );
}
