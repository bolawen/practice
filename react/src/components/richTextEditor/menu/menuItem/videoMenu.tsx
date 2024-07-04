import { Editor } from "@tiptap/react";

type VideoMenuProps = {
  editor: Editor;
};

function VideoMenu(props: VideoMenuProps) {
  const { editor } = props;

  const onInputChange = (e: any) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      const src = reader.result as string;
      //   if (videoType === VIDEO_TYPE.YOUTUBE) {
      //     editor.commands.setYoutubeVideo({ src });
      //   } else {
      //     editor.commands.setIframe(src, { width: "100%" });
      //   }

      editor.commands.setIframe(src, { width: "100%" });
    };
  };

  return (
    <div className="menu-item__video-menu">
      <label
        className="img-menu__label"
        htmlFor="video-menu__upload__input__uniqueId"
      >
        视频
        <input
          hidden
          type="file"
          onChange={onInputChange}
          id="video-menu__upload__input__uniqueId"
          className="video-menu__select-panel"
        />
      </label>
    </div>
  );
}

export default VideoMenu;
