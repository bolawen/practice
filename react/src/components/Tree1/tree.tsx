import "./tree.scss";
import React from "react";

interface TreeNode {
  label: string;
  id: number | string;
  pid: number | string;
  children?: TreeNode[];
}

interface TreeProps {
  data: TreeNode[];
}

interface IndentProps {
  level: number;
}

const Indent = (props: IndentProps) => {
  const list = [];
  const { level } = props;
  const baseItemClassName = "tree-node-indent-list-item";

  for (let i = 0; i < Number(level); i++) {
    list.push(<span key={i} className={`${baseItemClassName}`}></span>);
  }

  return <div className="tree-node-indent-list">{list}</div>;
};

const Tree: React.FC<TreeProps> = ({ data }) => {
  const renderTree = (nodes: TreeNode[], paraent: { level: number }) => {
    const { level } = paraent;

    return nodes.map((node) => {
      return (
        <div className="tree-node" key={node.id}>
          <Indent level={level} />
          <span className="tree-node-label">{node.label}</span>
          {node.children &&
            renderTree(node.children, {
              level: level + 1,
            })}
        </div>
      );
    });
  };

  return (
    <div className="tree">
      {renderTree(data, {
        level: 0,
      })}
    </div>
  );
};

export default Tree;
