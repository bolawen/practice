import { CSSProperties } from "react";

type TextContainerOfLineClampProps = {
  maxLines: number;

  text: JSX.Element | string;
};

function TextContainerOfLineClamp(props: TextContainerOfLineClampProps) {
  const { text, maxLines } = props;

  const textContainerStyle = {
    width: "200px",
    display: "flex",
  };

  const textStyle: CSSProperties = {
    overflow: "hidden",
    position: "relative",
    display: "-webkit-box",
    WebkitLineClamp: maxLines,
    WebkitBoxOrient: "vertical",
  };

  const textBeforeStyle: CSSProperties = {
    float: "right",
    width: "0",
    height: "calc(100% - 22px)",
  };

  const textAfterStyle: CSSProperties = {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
  };

  const overflowTagStyle: CSSProperties = {
    float: "right",
    clear: "both",
  };

  return (
    <div className="text-container-of-line-clamp">
      <div className="text-container" style={textContainerStyle}>
        <div className="text" style={textStyle}>
          <div className="text-before" style={textBeforeStyle}></div>
          <div className="overflow-tag" style={overflowTagStyle}>
            展开
          </div>
          {text}
          <div className="text-after" style={textAfterStyle}></div>
        </div>
      </div>
    </div>
  );
}

export default TextContainerOfLineClamp;
