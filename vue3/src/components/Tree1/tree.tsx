import "./tree.scss"
import { defineComponent, ref, toRaw, watch } from "vue";

interface IndentProps {
  level: number;
}

interface TreeNode {
  label: string;
  id: number | string;
  pid: number | string;
  children?: TreeNode[];
}

const Indent = defineComponent({
  name: "Indent",
  props: {
    level: {
      type: Number,
      default: 0,
    },
  },
  setup(props: IndentProps) {
    const list = ref<JSX.Element[]>([]);
    const baseItemClassName = "tree-node-indent-list-item";

    for (let i = 0; i < Number(props.level); i++) {
      list.value.push(<span key={i} class={`${baseItemClassName}`}></span>);
    }

    return () => <div class="tree-node-indent-list">{list.value}</div>;
  },
});

export default defineComponent({
  name: "Tree",
  props: {
    data: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    const treeData = ref<any[]>([]);

    watch(
      () => props.data,
      () => {
        treeData.value = toRaw(props.data);
      },
      {
        deep: true,
        immediate: true,
      }
    );

    const renderTree = (nodes: TreeNode[], paraent: { level: number }) => {
      const { level } = paraent;

      return nodes.map((node) => {
        return (
          <div class="tree-node" key={node.id}>
            <Indent level={level} />
            <span class="tree-node-label">{node.label}</span>
            {node.children &&
              renderTree(node.children, {
                level: level + 1,
              })}
          </div>
        );
      });
    };

    return ()=> <div class="tree">{renderTree(treeData.value, { level: 0 })}</div>;
  },
});
