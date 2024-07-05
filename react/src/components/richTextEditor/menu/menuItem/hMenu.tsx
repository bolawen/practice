import { Editor } from "@tiptap/core";

export type HProps = {
  editor: Editor;
};

function HMenu(props: HProps) {
  const { editor } = props;

  const onClick = (level: any) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  return (
    <div className="menu-item-container menu-item__h-menu">
      <div className="h-menu__list">
        <div
          onClick={() => onClick(1)}
          className={`menu-item h-menu__item ${
            editor.isActive("heading", { level: 1 }) ? "menu-item-active" : ""
          }`}
        >
          h1
        </div>
        <div
          className={`menu-item h-menu__item ${
            editor.isActive("heading", { level: 2 }) ? "menu-item-active" : ""
          }`}
          onClick={() => onClick(2)}
        >
          h2
        </div>
      </div>
    </div>
  );
}

export default HMenu;
