import { Editor } from "@tiptap/react";
import { defautltCustomMenuBar } from "./menuMap";

type MenuBarProps = {
  editor: Editor;
};

function CustomMenuBar(props: MenuBarProps) {
  const { editor } = props;

  return (
    <div className="menu-bar">
      <div className="menu-bar-list">
        {defautltCustomMenuBar.map((menu, index) => {
          return (
            <div key={index} className="menu-bar-item">
              {menu(editor)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CustomMenuBar;
