import { Editor } from "@tiptap/core";

export type YoutubeVideoMenuProps = {
  editor: Editor;
};

function YoutubeVideoMenu(props: YoutubeVideoMenuProps) {
  const { editor } = props;

  const onClick = () => {
    const url = window.prompt("Enter YouTube URL");

    if (url) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: 640,
        height: 480,
      });
    }
  };

  return (
    <div className="menu-item-container menu-item__youtube-video-menu">
      <div className={`menu-item youtube-video-menu_item`} onClick={onClick}>
        Youtube 视频
      </div>
    </div>
  );
}

export default YoutubeVideoMenu;
