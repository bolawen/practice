import { Editor } from "@tiptap/core";

export type BoldMenuProps = {
  editor: Editor;
};

function BoldMenu(props: BoldMenuProps) {
  const { editor } = props;

  const isEmpty = editor.isEmpty;
  const isFocused = editor.isFocused;

  const onBold = () => {
    if(isEmpty && !isFocused){
      console.log("kkk")
      return;
    }

    editor.chain().focus().toggleBold().run();
  };

  return (
    <div className="menu-item-container menu-item__bold-menu">
      <div
        onClick={onBold}
        className={`menu-item bold-menu_item ${
          editor.isActive("bold") ? "menu-item-active" : ""
        }`}
      >
        加粗
      </div>
    </div>
  );
}

export default BoldMenu;
