import { Editor } from "@tiptap/core";

export type OrderedListMenuProps = {
  editor: Editor;
};

function OrderedListMenu(props: OrderedListMenuProps) {
  const { editor } = props;

  const onOrderedList = () => {
    editor.chain().focus().toggleOrderedList().run();
  };

  return (
    <div className="menu-item-container menu-item__ordered-list-menu">
      <div
        onClick={onOrderedList}
        className={`menu-item ordered-list-menu_item ${
          editor.isActive("orderedList") ? "menu-item-active" : ""
        }`}
      >
        序号列表
      </div>
    </div>
  );
}

export default OrderedListMenu;
