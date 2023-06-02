import { produce, Draft,nothing } from "immer"
import { useMemo, useReducer } from "react";

export type DraftFunction<S> = (draft: Draft<S>) => void;
export type Updater<S> = (arg: S | DraftFunction<S>) => void;
export type ImmerHook<S> = [S, Updater<S>];
export type ImmerReducer<S, A> = (
    draftState: Draft<S>,
    action: A
  ) => void | (S extends undefined ? typeof nothing : S);
  export type Reducer<S = any, A = any> = ImmerReducer<S, A>;
  

export const useImmerReducer = <S,A,I>(reducer:  ImmerReducer<S, A>,initializerArg:S & I ,initializer?: (arg: S & I) => S)=>{
    const cachedReducer = useMemo(() => produce(reducer), [reducer]);
  return useReducer(cachedReducer, initializerArg as any, initializer as any);
}   