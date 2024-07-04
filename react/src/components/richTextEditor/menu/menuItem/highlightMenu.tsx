import { Editor } from "@tiptap/react";

type HighlightMenuProps = {
  editor: Editor;
};

function HighlightMenu(props: HighlightMenuProps) {
  const { editor } = props;
  const textStyle = editor.getAttributes("textStyle") || {};
  const highlightStyle = editor.getAttributes("highlight") || {};
  const color = highlightStyle.color || textStyle.backgroundColor || "#FFFFFF";

  const onInputChange = (event: any) => {
    const value = event.target.value;
    editor.chain().focus().setHighlight({ color: value }).run();
    editor.commands.focus();
  };

  return (
    <div className="menu-item__highlight-menu">
      <label
        className="highlight-menu__label"
        htmlFor="highlight-menu__select-panel__uniqueId"
      >
        背景颜色
        <input
          hidden
          type="color"
          value={color}
          onChange={onInputChange}
          className="highlight-menu__select-panel"
          id="highlight-menu__select-panel__uniqueId"
        />
      </label>
    </div>
  );
}

export default HighlightMenu;
