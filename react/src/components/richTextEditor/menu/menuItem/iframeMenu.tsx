import { Editor } from "@tiptap/core";

type IframeMenuProps = {
  editor: Editor;
};

function IframeMenu(props: IframeMenuProps) {
  const { editor } = props;

  const onClick = () => {
    const url = window.prompt("Enter Iframe URL");

    if (url) {
      editor.commands.setIframe(url, { width: "100%" });
    }
  };

  return (
    <div className="menu-item-container menu-item__iframe-menu">
      <div className={`menu-item iframe-menu_item`} onClick={onClick}>
        Iframe
      </div>
    </div>
  );
}

export default IframeMenu;
