import { Editor } from "@tiptap/react";

type LinkMenuProps = {
  editor: Editor;
};

function LinkMenu(props: LinkMenuProps) {
  const { editor } = props;
  const onClick = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="menu-item__link-menu">
      <button onClick={onClick}>插入链接</button>
    </div>
  );
}

export default LinkMenu;
