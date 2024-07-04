import {
  useEditor,
  EditorContent,
  FloatingMenu,
  EditorEvents,
  BubbleMenu,
} from "@tiptap/react";
import "./richTextEditor.scss";
import { useEffect } from "react";
import CustomMenuBar from "./menu/customMenuBar";
import BubbleMenuChildren from "./menu/bubbleMenuChildren";
import FloatingMenuChildren from "./menu/floatingMenuChildren";
import { getExtensioinsList } from "./extensions/extensionList";

type RichTextEditorProps = {
  content: string;
  onUpdate: (htmlContent: string, textContent: string) => void;
};

function RichTextEditor(props: RichTextEditorProps) {
  const { content = "", onUpdate } = props;

  const onEditorUpdate = (props: EditorEvents["update"]) => {
    const { editor } = props;
    onUpdate?.(editor.getHTML(), editor.getText());
  };

  const editor = useEditor({
    content,
    onUpdate: onEditorUpdate,
    extensions: getExtensioinsList(),
  });

  useEffect(() => {
    if (!editor) {
      return;
    }
    editor.commands.setContent(content);
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-editor rich-text-editor__tiptap-react">
      <div className="rich-text-editor__container">
        <div className="rich-text-editor__menu-bar">
          <CustomMenuBar editor={editor} />
        </div>
        <div className="rich-text-editor__editor">
          <EditorContent editor={editor} />
          <FloatingMenu editor={editor}>
            <FloatingMenuChildren editor={editor} />
          </FloatingMenu>
          <BubbleMenu editor={editor}>
            <BubbleMenuChildren editor={editor} />
          </BubbleMenu>
        </div>
      </div>
    </div>
  );
}

export default RichTextEditor;
