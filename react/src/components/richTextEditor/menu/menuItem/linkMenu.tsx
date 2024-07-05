import { Editor } from "@tiptap/react";

type LinkMenuProps = {
  editor: Editor;
};

function LinkMenu(props: LinkMenuProps) {
  const { editor } = props;
  const onClick = () => {
    const selection = editor.state.selection;
    const text = editor.state.doc.textBetween(selection.from, selection.to);

    if (text) {
      const url = window.prompt("URL", "");
      if (url === null) {
        return;
      }

      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();

        return;
      }

      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    } else {
      const text = window.prompt("文本", "");
      const url = window.prompt("URL", "");
      if (url === null || text === null) {
        return;
      }
      editor
        .chain()
        .focus()
        .addLink({
          text,
          href: url,
          title: text,
        })
        .run();
    }
  };

  return (
    <div className="menu-item-container menu-item__link-menu">
      <div className={`menu-item link-menu_item`} onClick={onClick}>
        插入链接
      </div>
    </div>
  );
}

export default LinkMenu;
