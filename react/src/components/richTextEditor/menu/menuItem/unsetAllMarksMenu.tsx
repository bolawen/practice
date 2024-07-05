import { Editor } from "@tiptap/core";

export type UnsetAllMarksMenuProps = {
  editor: Editor;
};

function UnsetAllMarksMenu(props: UnsetAllMarksMenuProps) {
  const { editor } = props;

  const onUnsetAllMarks = () => {
    editor.chain().focus().unsetAllMarks().run();
  };

  return (
    <div className="menu-item-container menu-item__unset-all-marks-menu">
      <div
        onClick={onUnsetAllMarks}
        className={`menu-item unset-all-marks-menu_item`}
      >
        清除全部样式
      </div>
    </div>
  );
}

export default UnsetAllMarksMenu;
