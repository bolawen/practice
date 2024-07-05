import HMenu from "./menuItem/hMenu";
import DoMenu from "./menuItem/doMenu";
import { Editor } from "@tiptap/react";
import ImgMenu from "./menuItem/imgMenu";
import CodeMenu from "./menuItem/codeMenu";
import BoldMenu from "./menuItem/boldMenu";
import LinkMenu from "./menuItem/linkMenu";
import TableMenu from "./menuItem/tableMenu";
import VideoMenu from "./menuItem/videoMenu";
import ItalicMenu from "./menuItem/italicMenu";
import IframeMenu from "./menuItem/iframeMenu";
import StrikeMenu from "./menuItem/strikeMenu";
import FontSizeMenu from "./menuItem/fontSizeMenu";
import FontColorMenu from "./menuItem/fontColorMenu";
import HighlightMenu from "./menuItem/highlightMenu";
import TextAlignMenu from "./menuItem/textAlignMenu";
import UnderlineMenu from "./menuItem/underlineMenu";
import OrderedListMenu from "./menuItem/orderedListMenu";
import BulletListMenuMenu from "./menuItem/bulletListMenu";
import YoutubeVideoMenu from "./menuItem/youtubeVideoMenu";
import UnsetAllMarksMenu from "./menuItem/unsetAllMarksMenu";

const hMenu = (editor: Editor) => {
  return <HMenu editor={editor} />;
};

const doMenu = (editor: Editor) => {
  return <DoMenu editor={editor} />;
};

const unsetAllMarksMenu = (editor: Editor) => {
  return <UnsetAllMarksMenu editor={editor} />;
};

const fontSizeMenu = (editor: Editor) => {
  return <FontSizeMenu editor={editor} />;
};

const boldMenu = (editor: Editor) => {
  return <BoldMenu editor={editor} />;
};

const italicMenu = (editor: Editor) => {
  return <ItalicMenu editor={editor} />;
};

const underlineMenu = (editor: Editor) => {
  return <UnderlineMenu editor={editor} />;
};

const strikeMenu = (editor: Editor) => {
  return <StrikeMenu editor={editor} />;
};

const fontColorMenu = (editor: Editor) => {
  return <FontColorMenu editor={editor} />;
};

const highlightMenu = (editor: Editor) => {
  return <HighlightMenu editor={editor} />;
};

const orderedListMenu = (editor: Editor) => {
  return <OrderedListMenu editor={editor} />;
};

const bulletListMenu = (editor: Editor) => {
  return <BulletListMenuMenu editor={editor} />;
};

const textAlignMenu = (editor: Editor) => {
  return <TextAlignMenu editor={editor} />;
};

const linkMenu = (editor: Editor) => {
  return <LinkMenu editor={editor} />;
};

const codeMenu = (editor: Editor) => {
  return <CodeMenu editor={editor} />;
};

const imgMenu = (editor: Editor) => {
  return <ImgMenu editor={editor} />;
};

const videoMenu = (editor: Editor) => {
  return <VideoMenu editor={editor} />;
};

const youtubeVideoMenu = (editor: Editor) => {
  return <YoutubeVideoMenu editor={editor} />;
};

const iframeMenu = (editor: Editor) => {
  return <IframeMenu editor={editor} />;
};

const tableMenu = (editor: Editor) => {
  return <TableMenu editor={editor} />;
};

export const defaultFloatingMenu = [hMenu, bulletListMenu];

export const defaultBubbleMenu = [
  boldMenu,
  italicMenu,
  underlineMenu,
  strikeMenu,
];

export const defautltCustomMenuBar = [
  doMenu,
  hMenu,
  unsetAllMarksMenu,
  fontSizeMenu,
  boldMenu,
  italicMenu,
  underlineMenu,
  strikeMenu,
  fontColorMenu,
  highlightMenu,
  orderedListMenu,
  bulletListMenu,
  textAlignMenu,
  linkMenu,
  codeMenu,
  imgMenu,
  videoMenu,
  youtubeVideoMenu,
  iframeMenu,
  tableMenu,
];
