import { Editor } from "@tiptap/core";

export type ItalicMenuProps = {
  editor: Editor;
};

function ItalicMenu(props: ItalicMenuProps) {
  const { editor } = props;

  const onItalic = () => {
    editor.chain().focus().toggleItalic().run();
  };

  return (
    <div className="menu-item-container menu-item__italic-menu">
      <div
        onClick={onItalic}
        className={`menu-item italic-menu_item ${
          editor.isActive("italic") ? "menu-item-active" : ""
        }`}
      >
        斜体
      </div>
    </div>
  );
}

export default ItalicMenu;
