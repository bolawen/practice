import { Editor } from "@tiptap/react";

type FontColorMenuProps = {
  editor: Editor;
};

function FontColorMenu(props: FontColorMenuProps) {
  const { editor } = props;
  const textStyle = editor.getAttributes("textStyle") || {};
  const color = textStyle.color || "#222222";

  const onInputChange = (event: any) => {
    const value = event.target.value;
    editor.chain().focus().setColor(value).run();
    editor.commands.focus();
  };

  return (
    <div className="menu-item__font-color-menu">
      <label
        className="font-color-menu__label"
        htmlFor="font-color-menu__select-panel__uniqueId"
      >
        字体颜色
        <input
          hidden
          type="color"
          value={color}
          onChange={onInputChange}
          className="font-color-menu__select-panel"
          id="font-color-menu__select-panel__uniqueId"
        />
      </label>
    </div>
  );
}

export default FontColorMenu;
