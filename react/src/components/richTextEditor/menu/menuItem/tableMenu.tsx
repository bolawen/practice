import { Editor } from "@tiptap/core";

type TableMenuProps = {
  editor: Editor;
};

function TableMenu(props: TableMenuProps) {
  const { editor } = props;

  const onInsertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const onAddColumnBefore = () => {
    editor.chain().focus().addColumnBefore().run();
  };

  const onAddColumnAfter = () => {
    editor.chain().focus().addColumnAfter().run();
  };

  const onRemoveColumn = () => {
    editor.chain().focus().deleteColumn().run();
  };

  const onAddRowBefore = () => {
    editor.chain().focus().addRowBefore().run();
  };

  const onAddRowAfter = () => {
    editor.chain().focus().addRowAfter().run();
  };

  const onRemoveRow = () => {
    editor.chain().focus().deleteRow().run();
  };

  const onRemoveTable = () => {
    editor.chain().focus().deleteTable().run();
  };

  const onMergeCells = () => {
    editor.chain().focus().mergeCells().run();
  };

  const onSplitCell = () => {
    editor.chain().focus().splitCell().run();
  };

  return (
    <div className="menu-item-container menu-item__table-menu">
      <div className="table-menu__list">
        <div className="menu-item table-menu__item" onClick={onInsertTable}>
          插入表格
        </div>
        <div className="menu-item table-menu__item" onClick={onAddColumnBefore}>
          之前插入列
        </div>
        <div className="menu-item table-menu__item" onClick={onAddColumnAfter}>
          之后插入列
        </div>
        <div className="menu-item table-menu__item" onClick={onRemoveColumn}>
          删除列
        </div>
        <div className="menu-item table-menu__item" onClick={onAddRowBefore}>
          之前插入行
        </div>
        <div className="menu-item table-menu__item" onClick={onAddRowAfter}>
          之后插入行
        </div>
        <div className="menu-item table-menu__item" onClick={onRemoveRow}>
          删除行
        </div>
        <div className="menu-item table-menu__item" onClick={onRemoveTable}>
          删除表格
        </div>
        <div className="menu-item table-menu__item" onClick={onMergeCells}>
          合并单元格
        </div>
        <div className="menu-item table-menu__item" onClick={onSplitCell}>
          分割单元格
        </div>
      </div>
    </div>
  );
}

export default TableMenu;
