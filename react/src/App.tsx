import { useState } from "react";
import RichTextEditor from "./components/richTextEditor/richTextEditor";

function App() {
  const [content, setContent] = useState<string>("<p>Initial content</p>");

  const onUpdate = (htmlContent: string, textContent: string) => {
    console.log(htmlContent, textContent);
    setContent(htmlContent);
  };

  return (
    <div className="app">
      <RichTextEditor content={content} onUpdate={onUpdate} />
    </div>
  );
}

export default App;
