import { produce,Draft, freeze } from "immer";
import { useCallback, useState } from "react";

export type DraftFunction<S> = (draft: Draft<S>) => void;
export type Updater<S> = (arg: S | DraftFunction<S>) => void;
export type ImmerHook<S> = [S, Updater<S>];
export type UseImmer = <S = any>(initialValue: S | (() => S)) => ImmerHook<S>;

export const  useImmer:UseImmer = (baseState: any) =>{
  const [value, updateValue] = useState(() =>
    freeze(typeof baseState === "function" ? baseState() : baseState, true)
  );

  return [
    value,
    useCallback((updater: any) => {
      if (typeof updater === "function") updateValue(produce(updater));
      else updateValue(freeze(updater));
    }, []),
  ];
}
