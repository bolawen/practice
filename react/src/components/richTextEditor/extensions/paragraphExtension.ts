import { mergeAttributes } from "@tiptap/core";
import BasicParagraph from "@tiptap/extension-paragraph";

interface ImageAttr {
    src: string;
    alt?: string;
    title?: string;
    width?: string;
    height?: string;
    style?: string;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        img: {
            setImage: (options: ImageAttr) => ReturnType;
        };
    }
}

const unsupportStyles = ["font-family", "mso-"];

const checkUnsupportStyle = (k?: string, v?: string) => {
  if (!k || !v) {
    return false;
  }
  if (k === "background-image" && v.startsWith("url(") && !v.endsWith(")")) {
    return false;
  }
  if (unsupportStyles.some((s) => k.includes(s))) {
    return false;
  }
  return true;
};

export function parseStyle(styleString: string = "") {
  const styles: Record<string, string> = {};
  const styleStrs = styleString.split(";");

  for (let i = 0; i < styleStrs.length; i++) {
    const style = styleStrs[i];
    const splitIndex = style.indexOf(":");
    const key = style.slice(0, splitIndex);
    const value = style.slice(splitIndex + 1);
    const k = key.trim();
    const v = value.trim();
    if (checkUnsupportStyle(k, v)) {
      styles[k] = v.replace(/pt/g, "px");
    }
  }

  return styles;
}

export function getStringStyle(style: Record<string, string>) {
  return Object.entries(style)
    .map(([key, value]) => `${key}: ${value}`)
    .join(";");
}

const ParagraphExtension = BasicParagraph.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: "",
      },
      textAlign: {
        parseHTML: (element) => element.style.textAlign,
        renderHTML: (attributes) => {
          if (!attributes.textAlign) {
            return false;
          }
          return { style: `text-align: ${attributes.textAlign}` };
        },
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    const style = HTMLAttributes.style;
    HTMLAttributes.style = getStringStyle(parseStyle(style));
    return [
      "p",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },
});

export default ParagraphExtension;
