import { Editor } from "@tiptap/react";

type BubbleMenuChildrenProps = {
  editor: Editor;
};
function BubbleMenuChildren(props: BubbleMenuChildrenProps) {
  const { editor } = props;

  return (
    <div className="bubble-menu__menu-list">
      <div className="bubble-menu__menu-item">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "is-active" : ""}
        >
          Bold
        </button>
      </div>
      <div className="bubble-menu__menu-item">
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is-active" : ""}
        >
          Italic
        </button>
      </div>
      <div className="bubble-menu__menu-item">
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "is-active" : ""}
        >
          Strike
        </button>
      </div>
    </div>
  );
}

export default BubbleMenuChildren;
