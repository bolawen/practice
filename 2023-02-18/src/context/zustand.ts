import {create} from 'zustand';

type UseNumStateType = {
    num: number;
    setNum: (value: number) => void;
};

const useNum = create<UseNumStateType>()((set) => ({
    num: 0,
    setNum: (value) => set((state) => ({num: state.num + value})),
}));

export {useNum};
