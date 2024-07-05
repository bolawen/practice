import { Editor } from "@tiptap/react";

type ImgMenuProps = {
  editor: Editor;
};

function ImgMenu(props: ImgMenuProps) {
  const { editor } = props;

  const onInputChange = (e: any) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      const url = reader.result;
      editor.commands.setImage({ src: url as string });
    };
  };

  return (
    <div className="menu-item-container menu-item__img-menu">
      <label
        className="menu-item img-menu__label"
        htmlFor="img-menu__upload__input__uniqueId"
      >
        图片
        <input
          hidden
          type="file"
          accept="image/*"
          onChange={onInputChange}
          className="img-menu__select-panel"
          id="img-menu__upload__input__uniqueId"
        />
      </label>
    </div>
  );
}

export default ImgMenu;
