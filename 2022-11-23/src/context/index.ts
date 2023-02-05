import React, {createContext} from 'react';
import {StateType, ActionType} from '@/reducer';

export interface ContextType {
    state: StateType;
    dispatch: React.Dispatch<ActionType>;
}

export const Context = createContext<ContextType>({} as ContextType);
export const {Provider, Consumer} = Context;
