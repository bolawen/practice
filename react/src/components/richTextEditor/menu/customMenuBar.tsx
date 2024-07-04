import { menuMap } from "./menuMap";
import { Editor } from "@tiptap/react";

type MenuBarProps = {
  editor: Editor;
};

function CustomMenuBar(props: MenuBarProps) {
  const { editor } = props;

  return (
    <div className="menu-bar">
      <div className="menu-bar-list">
        {Object.keys(menuMap).map((menuKey,index) => {
          return (
            <div key={index} className="menu-bar-item">{menuMap[menuKey](editor)}</div>
          );
        })}
      </div>
    </div>
  );
}

export default CustomMenuBar;
