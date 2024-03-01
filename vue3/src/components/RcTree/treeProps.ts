export const TreeProps = () => ({
  treeData: {
    type: Array
  },
  children: {
    type: Array
  },
  fieldName: {
    type: Object
  }
});

export const TreeNodeProps = () => ({
  title: String,
  level: Number,
  expanded: Boolean,
  eventKey: [String, Number],
  data: {
    type: Object,
    default: undefined
  },
  isStart: {
    type: Array
  },
  isEnd: {
    type: Array
  },
  children: Array
});

export const indentProps = () => ({
  level: Number,
  isEnd: Array,
  isStart: Array
});
