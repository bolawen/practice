import { useRef } from "react";
import RichTextEditor from "./components/richTextEditor/richTextEditor";

function App() {
  const contentRef = useRef({
    htmlContent: "",
    textContent: "",
  });

  const onUpdate = (htmlContent: string, textContent: string) => {
    contentRef.current.htmlContent = htmlContent;
    contentRef.current.textContent = textContent;
    console.log("contentRef.current: ", contentRef.current);
  };

  return (
    <div className="app">
      <RichTextEditor
        content={contentRef.current.htmlContent}
        onUpdate={onUpdate}
      />
    </div>
  );
}

export default App;
