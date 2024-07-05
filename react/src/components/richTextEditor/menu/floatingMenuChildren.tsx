import { Editor } from "@tiptap/react";
import { defaultFloatingMenu } from "./menuMap";

type FloatingMenuChildrenProps = {
  editor: Editor;
};

function FloatingMenuChildren(props: FloatingMenuChildrenProps) {
  const { editor } = props;

  return (
    <div className="floating-menu__menu-list">
      {defaultFloatingMenu.map((menu, index) => {
        return (
          <div key={index} className="floating-menu__menu-item">
            {menu(editor)}
          </div>
        );
      })}
    </div>
  );
}

export default FloatingMenuChildren;
