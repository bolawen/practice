import "./index.scss";
import { useImmer } from "use-immer";
import React, { useRef } from "react";
import { useVirtualList } from "ahooks";
import VirtualItem from "./virtualItem";
import { OriginalList } from "./interface";
import { list as originalListInit } from "./data";

function VirtualList() {
  const listRef = useRef(null);
  const listScrollRef = useRef(null);

  const [originalList, setOriginalList] =
    useImmer<OriginalList>(originalListInit);

  const [value, onChange] = React.useState<number>(0);
  const [list, scrollTo] = useVirtualList(originalList, {
    overscan: 5,
    itemHeight: 300,
    containerTarget: listRef,
    wrapperTarget: listScrollRef,
  });

  return (
    <div className="virtual-list">
      <div style={{ textAlign: "right", marginBottom: 16 }}>
        <input
          style={{ width: 120 }}
          placeholder="line number"
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <button
          style={{ marginLeft: 8 }}
          type="button"
          onClick={() => {
            scrollTo(Number(value));
          }}
        >
          滚动到
        </button>
      </div>
      <div ref={listRef} id="list" className="list">
        <div ref={listScrollRef} id="listScroll" className="list-scroll">
          {list.map((item) => {
            return (
              <VirtualItem
                key={item.data.id}
                item={item}
                setOriginalList={setOriginalList}
              ></VirtualItem>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default VirtualList;
