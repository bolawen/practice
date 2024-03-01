import { defineComponent } from 'vue';
import { indentProps } from './treeProps';

export default defineComponent({
  name: 'Indent',
  props: indentProps(),
  setup(props) {
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

    return () => {
      return <div className={`indent`}>{list}</div>;
    };
  }
});
