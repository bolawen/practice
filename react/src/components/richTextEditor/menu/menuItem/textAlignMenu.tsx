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
    <div className="menu-item__text-align-menu">
      <div className="text-align-menu__list">
        <div className="text-align-menu__item">
          <button onClick={() => onClick("left")}>左对齐</button>
        </div>
        <div className="text-align-menu__item">
          <button onClick={() => onClick("center")}>居中</button>
        </div>
        <div className="text-align-menu__item">
          <button onClick={() => onClick("right")}>右对齐</button>
        </div>
      </div>
    </div>
  );
}

export default TextAlignMenu;
