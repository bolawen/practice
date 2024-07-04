import Link from "@tiptap/extension-link";
import Text from "@tiptap/extension-text";
import Code from "@tiptap/extension-code";
import { AnyExtension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Youtube from "@tiptap/extension-youtube";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "./textStyleExtension";
import ListItem from "@tiptap/extension-list-item";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import TableHeader from "@tiptap/extension-table-header";
import CharacterCount from "@tiptap/extension-character-count";
import ParagraphExtension from "./paragraphExtension";
import { ImgExtension } from "./imgExtension";
import { VidevideoExtension } from "./videoExtension";
import { DivExtension } from "./divExtension";
import { IframeExtension } from "./iframeExtension";

const commonExtensions = [
  StarterKit,
  Text,
  Code,
  TextStyle,
  Underline,
  TableHeader,
  DivExtension,
  ImgExtension,
  IframeExtension,
  VidevideoExtension,
  ParagraphExtension,
  Highlight.configure({
    multicolor: true,
  }),
  TextAlign.configure({
    types: ["heading", "paragraph", "section", "div"],
  }),
  Youtube.configure({
    disableKBcontrols: true,
  }),
  Link.configure({
    protocols: [
      {
        scheme: "tel",
        optionalSlashes: true,
      },
    ],
  }),
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
];

export function getExtensioinsList(
  params: {
    maxLength?: number;
    placeholder?: string;
  } = {}
): AnyExtension[] {
  const { maxLength, placeholder } = params;
  const extensioinsList: AnyExtension[] = [...commonExtensions];

  if (maxLength != undefined) {
    extensioinsList.push(CharacterCount.configure({ limit: maxLength }));
  }

  if (placeholder != undefined) {
    extensioinsList.unshift(
      Placeholder.configure({
        placeholder: placeholder,
      })
    );
  }

  return extensioinsList;
}
