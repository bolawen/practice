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
    <div className="menu-item__img-menu">
      <label
        className="img-menu__label"
        htmlFor="img-menu__upload__input__uniqueId"
      >
        图片
        <input
          hidden
          type="file"
          onChange={onInputChange}
          id="img-menu__upload__input__uniqueId"
          className="img-menu__select-panel"
        />
      </label>
    </div>
  );
}

export default ImgMenu;
