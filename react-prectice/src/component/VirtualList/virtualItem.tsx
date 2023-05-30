import React from "react";
import { useImmer } from "use-immer";
import { useUpdateEffect } from "ahooks";
import { Item, ItemProp } from "./interface";

function VirtualItem(props: ItemProp) {
  const { item: itemProp, setOriginalList } = props;
  const [item, setItem] = useImmer<Item>(itemProp);

  const handleItemClick = (item: Item) => {
    const isEditNew = !item.data.isEdit;
    setItem((draft) => {
      draft.data.isEdit = isEditNew;
    });
  };

  useUpdateEffect(() => {
    if (!item.data.isEdit) {
      setOriginalList((draft) => {
        draft[item.index] = {
          ...item.data,
        };
      });
    }
  }, [item.data.isEdit]);

  return (
    <div className="item" key={item.data.id}>
      <h2>{item.data.id}</h2>
      {item.data.isEdit ? (
        <input
          type="text"
          value={item.data.title}
          onChange={(e) => {
            setItem((draft) => {
              const {
                target: { value },
              } = e;
              draft.data.title = value;
            });
          }}
        />
      ) : (
        <h3>{item.data.title}</h3>
      )}
      {item.data.isEdit ? (
        <input
          type="text"
          value={item.data.desc}
          onChange={(e) => {
            setItem((draft) => {
              const {
                target: { value },
              } = e;
              draft.data.title = value;
            });
          }}
        />
      ) : (
        <p>{item.data.desc}</p>
      )}
      <img src={item.data.img} alt="" />
      <div>
        <button onClick={() => handleItemClick(item)}>
          {item.data.isEdit ? "确定" : "修改"}
        </button>
      </div>
    </div>
  );
}

export default React.memo(VirtualItem);
