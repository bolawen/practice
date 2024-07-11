import React, {
  useState,
  useRef,
  useEffect,
  ReactNode,
  CSSProperties,
} from "react";
import "./TextContainer.scss";

interface TextContainerProps {
  text: ReactNode;
  maxLines: number;
  placement?: "bottom" | "rightBottom";
}

const TextContainer: React.FC<TextContainerProps> = ({
  text,
  maxLines,
  placement = "bottom",
}) => {
  const [isTruncated, setIsTruncated] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      const element = textRef.current;
      if (element) {
        const isOverflowing = element.scrollHeight > element.clientHeight;
        setIsTruncated(isOverflowing);

        if (placement === "rightBottom" && buttonRef.current) {
          const buttonHeight = buttonRef.current.offsetHeight;
          const buttonY = element.offsetHeight - buttonHeight;
          buttonRef.current.style.top = `${buttonY}px`;
        }
      }
    };

    checkOverflow();
  }, [text, maxLines, placement]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const containerStyle: CSSProperties = {
    WebkitLineClamp: isExpanded ? "unset" : maxLines,
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  return (
    <div className="text-container">
      <div
        ref={textRef}
        className={`text ${isExpanded ? "expanded" : ""}`}
        style={containerStyle}
      >
        {text}
        {!isExpanded && isTruncated && <span className="ellipsis">...</span>}
      </div>
      {isTruncated && (
        <button
          ref={buttonRef}
          className={`toggle-button ${placement}`}
          onClick={handleToggle}
          style={{
            position: placement === "rightBottom" ? "absolute" : "static",
          }}
        >
          {isExpanded ? "收起" : "展开"}
        </button>
      )}
    </div>
  );
};

export default TextContainer;
