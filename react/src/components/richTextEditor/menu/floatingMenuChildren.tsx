import { Editor } from "@tiptap/react";

type FloatingMenuChildrenProps = {
  editor: Editor;
};

function FloatingMenuChildren(props: FloatingMenuChildrenProps) {
  const { editor } = props;

  return (
    <div className="floating-menu__menu-list">
      <div className="floating-menu__menu-item">
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={
            editor.isActive("heading", { level: 1 }) ? "is-active" : ""
          }
        >
          H1
        </button>
      </div>
      <div className="floating-menu__menu-item">
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 }) ? "is-active" : ""
          }
        >
          H2
        </button>
      </div>
      <div className="floating-menu__menu-item">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
        >
          Bullet list
        </button>
      </div>
    </div>
  );
}

export default FloatingMenuChildren;
