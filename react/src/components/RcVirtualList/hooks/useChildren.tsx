import Item from '../item';

export default function useChildren(params) {
  const { list, getKey, endIndex, renderFunc, setNodeRef, startIndex } = params;

  return list.slice(startIndex, endIndex + 1).map((item, index) => {
    const key = getKey(item);
    const eleIndex = startIndex + index;

    const node = renderFunc(item, eleIndex, {
      style: {}
    });

    return (
      <Item key={key} setRef={ele => setNodeRef(item, ele)}>
        {node}
      </Item>
    );
  });
}
