import './tree.scss';

function Indent(props) {
  const list = [];
  const { level, isEnd, isStart } = props;

  for (let i = 0; i < Number(level); i++) {
    let className = '';
    if (isStart[i]) {
      className += `indent-unit-start`;
    }
    if (isEnd[i]) {
      className += `indent-unit-end`;
    }

    list.push(<span key={i} className={`indent-unit ${className}`}></span>);
  }

  return <div className={`indent`}>{list}</div>;
}

export default Indent;
