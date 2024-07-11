import "./TextContainerOfLineClamp.scss";
import { CSSProperties, useEffect, useRef, useState } from "react";

type TextContainerOfLineClampProps = {
  width?: string;
  maxLines?: number;
  singleMode?: boolean;
  children?: JSX.Element;
  onlyShowExpand?: boolean;
  text?: JSX.Element | string;
  expandNode?: JSX.Element | string;
  collapseNode?: JSX.Element | string;
};

const infinityLines = 9999;

function TextContainerOfLineClamp(props: TextContainerOfLineClampProps) {
  const {
    text,
    children,
    maxLines = 1,
    width = "100%",
    expandNode = "",
    collapseNode = "",
    singleMode = false,
    onlyShowExpand = false,
  } = props;

  const [isOverflow, setIsOverflow] = useState(false);
  const textContentRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const overflowToggleTagRef = useRef<HTMLDivElement>(null);
  const overflowPlaceholderRef = useRef<HTMLDivElement>(null);

  const textContainerStyle: CSSProperties = {
    width,
    display: "flex",
  };

  const textContentStyle: CSSProperties = {
    overflow: "hidden",
    position: "relative",
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: isExpanded ? infinityLines : maxLines,
  };

  const checkTextOverflow = () => {
    if (!textContentRef.current) {
      return;
    }

    const { scrollHeight, clientHeight } = textContentRef.current;
    setIsOverflow(scrollHeight > clientHeight);
  };

  const computedOverflowPlaceholderHeight = () => {
    if (!overflowPlaceholderRef.current || !overflowToggleTagRef.current) {
      return;
    }

    overflowPlaceholderRef.current.style.height = `calc(100% - ${overflowToggleTagRef.current.clientHeight}px)`;
  };

  const handleToggleOverflowTag = () => {
    if (onlyShowExpand) {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    checkTextOverflow();

    window.addEventListener("resize", checkTextOverflow);
    return () => {
      window.removeEventListener("resize", checkTextOverflow);
    };
  }, []);

  useEffect(() => {
    computedOverflowPlaceholderHeight();
  }, [isOverflow,isExpanded]);

  return (
    <div className="text-container-of-line-clamp" style={{ width }}>
      <div className="text-container" style={textContainerStyle}>
        <div
          ref={textContentRef}
          className="text-content"
          style={textContentStyle}
        >
          {!singleMode && isOverflow && (
            <>
              <div
                ref={overflowPlaceholderRef}
                className="overflow-placeholder"
              ></div>
              <div
                ref={overflowToggleTagRef}
                className={`overflow-toggle-tag inline-mode ${
                  onlyShowExpand ? "only-show-expand" : ""
                }`}
                onClick={handleToggleOverflowTag}
              >
                {isExpanded ? collapseNode : expandNode}
              </div>
            </>
          )}
          {text || children}
        </div>
      </div>
      {singleMode && isOverflow && (
        <div
          ref={overflowToggleTagRef}
          className={`overflow-toggle-tag block-mode ${
            onlyShowExpand ? "only-show-expand" : ""
          }`}
          onClick={handleToggleOverflowTag}
        >
          {isExpanded ? collapseNode : expandNode}
        </div>
      )}
    </div>
  );
}

export default TextContainerOfLineClamp;
