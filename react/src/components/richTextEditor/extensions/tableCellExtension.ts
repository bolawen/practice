import BasicTableCell from '@tiptap/extension-table-cell';

const TableCellExtension = BasicTableCell.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            style: {
                default: '',
            },
            valign: {
                default: '',
            },
            align: {
                default: '',
            },
        };
    },
});

export default TableCellExtension;
