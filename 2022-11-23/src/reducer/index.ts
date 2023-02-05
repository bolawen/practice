export enum OperationTye {
    ADD = 'add',
    MIN = 'min',
}

export interface StateType {
    name: string;
    age: number;
}

export interface ActionType {
    type: OperationTye;
    payload: any;
}

function reducer(state: StateType, action: ActionType): StateType {
    const {type, payload} = action;
    switch (type) {
        case OperationTye.ADD:
            return (state = payload);
        case OperationTye.MIN:
            return (state = payload);
        default:
            return state;
    }
}

export default reducer;
