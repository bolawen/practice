import { Editor } from "@tiptap/core";

export type UnderlineMenuProps = {
  editor: Editor;
};

function UnderlineMenu(props: UnderlineMenuProps) {
  const { editor } = props;

  const onUnderline = () => {
    editor.chain().focus().toggleUnderline().run();
  };

  return (
    <div className="menu-item-container menu-item__underline-menu">
      <div
        onClick={onUnderline}
        className={`menu-item underline-menu_item ${
          editor.isActive("underline") ? "menu-item-active" : ""
        }`}
      >
        下划线
      </div>
    </div>
  );
}

export default UnderlineMenu;
