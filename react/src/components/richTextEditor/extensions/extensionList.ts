import Link from "@tiptap/extension-link";
import Text from "@tiptap/extension-text";
import Code from "@tiptap/extension-code";
import { AnyExtension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ImgExtension } from "./imgExtension";
import { DivExtension } from "./divExtension";
import TableExtension from "./tableExtension";
import Heading from "@tiptap/extension-heading";
import Youtube from "@tiptap/extension-youtube";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "./textStyleExtension";
import { VideoExtension } from "./videoExtension";
import Document from '@tiptap/extension-document';
import ListItem from "@tiptap/extension-list-item";
import TableRow from "@tiptap/extension-table-row";
import Underline from "@tiptap/extension-underline";
import { IframeExtension } from "./iframeExtension";
import Highlight from "@tiptap/extension-highlight";
import { AnchorExtension } from "./anchorExtension";
import TextAlign from "@tiptap/extension-text-align";
import ParagraphExtension from "./paragraphExtension";
import TableCellExtension from "./tableCellExtension";
import Placeholder from "@tiptap/extension-placeholder";
import TableHeader from "@tiptap/extension-table-header";
import CharacterCount from "@tiptap/extension-character-count";
import { EventHandlerExtension } from "./eventHandlerExtension";

const commonExtensionList = [
  StarterKit,
  Text,
  Code,
  Heading,
  TableRow,
  TextStyle,
  Document,
  Underline,
  TableHeader,
  DivExtension,
  VideoExtension,
  IframeExtension,
  TableCellExtension,
  ParagraphExtension,
  ImgExtension.configure({
    HTMLAttributes: {
      class: "rich-text-editor-img",
    },
  }),
  TableExtension.configure({
    resizable: true,
    HTMLAttributes: {
      class: "rich-text-editor-table",
    },
  }),
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
  AnchorExtension.configure({
    autolink: true,
    openOnClick: false,
    HTMLAttributes: {
      class: "rich-text-editor-anchor",
    },
    validate: (href: string) => /^https?:\/\//.test(href),
  }),
  EventHandlerExtension.configure({
    types: ["paragraph"],
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
  const extensioinsList: AnyExtension[] = [...commonExtensionList];

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
