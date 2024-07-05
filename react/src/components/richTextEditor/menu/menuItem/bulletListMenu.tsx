import { Editor } from "@tiptap/core";

export type BulletListMenuMenuProps = {
  editor: Editor;
};

function BulletListMenuMenu(props: BulletListMenuMenuProps) {
  const { editor } = props;

  const onbulletListMenu = () => {
    editor.chain().focus().toggleBulletList().run();
  };

  return (
    <div className="menu-item-container menu-item__bullet-list-menu">
      <div
        onClick={onbulletListMenu}
        className={`menu-item bullet-list-menu_item ${
          editor.isActive("bulletList") ? "menu-item-active" : ""
        }`}
      >
        符号列表
      </div>
    </div>
  );
}

export default BulletListMenuMenu;
