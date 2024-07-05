import { Editor } from "@tiptap/react";

type TextAlignMenuProps = {
  editor: Editor;
};

function TextAlignMenu(props: TextAlignMenuProps) {
  const { editor } = props;

  const onClick = (type: string) => {
    editor.chain().focus().setTextAlign(type).run();
  };

  return (
    <div className="menu-item-container menu-item__text-align-menu">
      <div className="text-align-menu__list">
        <div
          onClick={() => onClick("left")}
          className={`menu-item text-align-menu__item ${
            editor.isActive({ textAlign: "left" }) ? "menu-item-active" : ""
          }`}
        >
          左对齐
        </div>
        <div
          onClick={() => onClick("center")}
          className={`menu-item text-align-menu__item ${
            editor.isActive({ textAlign: "center" }) ? "menu-item-active" : ""
          }`}
        >
          居中
        </div>
        <div
          onClick={() => onClick("right")}
          className={`menu-item text-align-menu__item ${
            editor.isActive({ textAlign: "right" }) ? "menu-item-active" : ""
          }`}
        >
          右对齐
        </div>
      </div>
    </div>
  );
}

export default TextAlignMenu;
