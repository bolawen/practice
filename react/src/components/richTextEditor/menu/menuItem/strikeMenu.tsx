import { Editor } from "@tiptap/core";

export type StrikeMenuProps = {
  editor: Editor;
};

function StrikeMenu(props: StrikeMenuProps) {
  const { editor } = props;

  const onStrike = () => {
    editor.chain().focus().toggleStrike().run();
  };

  return (
    <div className="menu-item-container menu-item__strike-menu">
      <div
        onClick={onStrike}
        className={`menu-item strike-menu_item ${
          editor.isActive("strike") ? "menu-item-active" : ""
        }`}
      >
        删除线
      </div>
    </div>
  );
}

export default StrikeMenu;
