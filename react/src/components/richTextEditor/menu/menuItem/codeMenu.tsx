import { Editor } from "@tiptap/core";

export type CodeMenuProps = {
  editor: Editor;
};

function CodeMenu(props: CodeMenuProps) {
  const { editor } = props;

  const onCode = () => {
    editor.chain().focus().toggleCode().run();
  };

  return (
    <div className="menu-item-container menu-item__code-menu">
      <div className={`menu-item code-menu_item`} onClick={onCode}>
        代码块
      </div>
    </div>
  );
}

export default CodeMenu;
