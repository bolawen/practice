import { Editor } from "@tiptap/react";

type VideoMenuProps = {
  editor: Editor;
};

function VideoMenu(props: VideoMenuProps) {
  const { editor } = props;

  const onInputChange = (e: any) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function (event: any) {
      const videoBlob = new Blob([event.target.result], { type: file.type });
      const blobUrl = URL.createObjectURL(videoBlob);
      editor.commands.setVideo(blobUrl, { height: "auto", width: "100%" });
    };
  };

  return (
    <div className="menu-item-container menu-item__video-menu">
      <label
        className="menu-item img-menu__label"
        htmlFor="video-menu__upload__input__uniqueId"
      >
        视频
        <input
          hidden
          type="file"
          accept="video/*"
          onChange={onInputChange}
          className="video-menu__select-panel"
          id="video-menu__upload__input__uniqueId"
        />
      </label>
    </div>
  );
}

export default VideoMenu;
