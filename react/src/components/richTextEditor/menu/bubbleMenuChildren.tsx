import { Editor } from "@tiptap/react";
import { defaultBubbleMenu } from "./menuMap";

type BubbleMenuChildrenProps = {
  editor: Editor;
};
function BubbleMenuChildren(props: BubbleMenuChildrenProps) {
  const { editor } = props;

  return (
    <div className="bubble-menu__menu-list">
      {defaultBubbleMenu.map((menu, index) => {
        return (
          <div className="bubble-menu__menu-item" key={index}>
            {menu(editor)}
          </div>
        );
      })}
    </div>
  );
}

export default BubbleMenuChildren;
