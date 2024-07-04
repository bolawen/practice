import { Editor } from "@tiptap/react";
import LinkMenu from "./menuItem/linkMenu";
import FontSizeMenu from "./menuItem/fontSizeMenu";
import FontColorMenu from "./menuItem/fontColorMenu";
import HighlightMenu from "./menuItem/highlightMenu";
import TextAlignMenu from "./menuItem/textAlignMenu";
import ImgMenu from "./menuItem/imgMenu";
import VideoMenu from "./menuItem/videoMenu";

const undo = (editor: Editor) => {
  const onClick = () => {
    editor.chain().focus().undo().run();
  };
  return <button onClick={onClick}>撤销</button>;
};

const redo = (editor: Editor) => {
  const onClick = () => {
    editor.chain().focus().redo().run();
  };
  return <button onClick={onClick}>重做</button>;
};

const unsetAllMarks = (editor: Editor) => {
  const onClick = () => {
    editor.chain().focus().unsetAllMarks().run();
  };
  return <button onClick={onClick}>清除格式</button>;
};

const fontSize = (editor: Editor) => {
  return <FontSizeMenu editor={editor} />;
};

const bold = (editor: Editor) => {
  const onClick = () => {
    editor.chain().focus().toggleBold().run();
  };

  return <button onClick={onClick}>加粗</button>;
};

const italic = (editor: Editor) => {
  const onClick = () => {
    editor.chain().focus().toggleItalic().run();
  };

  return <button onClick={onClick}>斜体</button>;
};

const underline = (editor: Editor) => {
  const onClick = () => {
    editor.chain().focus().toggleUnderline().run();
  };

  return <button onClick={onClick}>下划线</button>;
};

const strike = (editor: Editor) => {
  const onClick = () => {
    editor.chain().focus().toggleStrike().run();
  };

  return <button onClick={onClick}>删除线</button>;
};

const color = (editor: Editor) => {
  return <FontColorMenu editor={editor} />;
};

const highlight = (editor: Editor) => {
  return <HighlightMenu editor={editor} />;
};

const orderedList = (editor: Editor) => {
  const onClick = () => {
    editor.chain().focus().toggleOrderedList().run();
  };
  return <button onClick={onClick}>序号列表</button>;
};

const bulletList = (editor: Editor) => {
  const onClick = () => {
    editor.chain().focus().toggleBulletList().run();
  };
  return <button onClick={onClick}>符号列表</button>;
};

const textAlign = (editor: Editor) => {
  return <TextAlignMenu editor={editor} />;
};

const link = (editor: Editor) => {
  return <LinkMenu editor={editor} />;
};

const codeBlockLowlight = (editor: Editor) => {
  const onClick = () => {
    editor.chain().focus().toggleCode().run();
  };
  return <button onClick={onClick}>代码块</button>;
};

const imgMenu = (editor: Editor) => {
  return <ImgMenu editor={editor} />;
};

const videoMenu = (editor: Editor) => {
  return <VideoMenu editor={editor} />;
};

export const menuMap: { [key: string]: any } = {
  undo,
  redo,
  unsetAllMarks,
  fontSize,
  bold,
  italic,
  underline,
  strike,
  color,
  highlight,
  orderedList,
  bulletList,
  textAlign,
  link,
  codeBlockLowlight,
  imgMenu,
  videoMenu,
};
