import { Editor } from "@tiptap/react";
import { useEffect, useState } from "react";

type FontSizeMenuProps = {
  editor: Editor;
};

const sizeList = [12, 14, 15, 16, 17, 18, 20, 24];
const normalizedSizeList = sizeList.map((size) => ({
  id: `${size}`,
  label: size + "px",
}));

function FontSizeMenu(props: FontSizeMenuProps) {
  const { editor } = props;
  const [showModal, setShowModal] = useState(false);
  const [fontSize, setFontSize] = useState(normalizedSizeList[0].id);

  const onSelect = (item: { id: string; label: string }) => {
    const size = item.id;
    setShowModal(false);
    setFontSize(size);
    editor.commands.setFontSize(size);
  };

  useEffect(() => {
    editor.on("selectionUpdate", () => {
      const fontSize = editor.getAttributes("textStyle").fontSize;
      setFontSize(fontSize || normalizedSizeList[0].id);
    });
  }, []);

  return (
    <div className="menu-item__font-size-menu">
      <div className="font-size-menu__trigger">
        <button onClick={() => setShowModal(true)}>{fontSize + "px"}</button>
      </div>
      {showModal && (
        <div className="font-size-menu__select-panel">
          <div className="font-size-menu__font-size-list">
            {normalizedSizeList.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelect(item)}
                className={`font-size-menu__font-size-item ${
                  item.id === fontSize ? "active" : ""
                }`}
              >
                <div style={{ fontSize: item.id + "px" }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FontSizeMenu;
