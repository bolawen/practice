import { Updater } from "use-immer";

export type OriginalItem = {
  id: number;
  title: string;
  desc: string;
  img: string;
  isEdit?: boolean;
};

export type OriginalList = OriginalItem[];

export type Item = { index: number; data: OriginalItem };

export type List = Item[];

export type ItemProp = {
  item: Item;
  setOriginalList: Updater<OriginalList>
};