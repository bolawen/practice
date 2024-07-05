import { Editor } from "@tiptap/core";

export type UndoMenuProps = {
  editor: Editor;
};

function DoMenu(props: UndoMenuProps) {
  const { editor } = props;

  const onUndo = () => {
    if (!editor.can().undo()) {
      return;
    }
    editor.chain().focus().undo().run();
  };

  const onRedo = () => {
    if (!editor.can().redo()) {
      return;
    }
    editor.chain().focus().redo().run();
  };

  return (
    <div className="menu-item-container menu-item__do-menu">
      <div className="do-menu__list">
        <div
          className={`menu-item do-menu__item ${
            !editor.can().undo() ? "menu-item-disabled" : ""
          }`}
          onClick={onUndo}
        >
          撤销
        </div>
        <div
          className={`menu-item do-menu__item ${
            !editor.can().redo() ? "menu-item-disabled" : ""
          }`}
          onClick={onRedo}
        >
          重做
        </div>
      </div>
    </div>
  );
}

export default DoMenu;
