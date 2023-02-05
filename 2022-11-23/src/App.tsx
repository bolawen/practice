import React, {useContext, useReducer} from 'react';
import {Context, Provider} from './context';
import Reducer, {OperationTye} from '@/reducer';

function Child() {
    const {state, dispatch} = useContext(Context);

    return (
        <div>
            Child
            <h3>{state.name}</h3>
            <h3>{state.age}</h3>
            <button
                type="button"
                onClick={() =>
                    dispatch({
                        type: OperationTye.ADD,
                        payload: {
                            name: '柏拉文修改',
                            age: 30,
                        },
                    })
                }>
                改变
            </button>
        </div>
    );
}

function App() {
    const [state, dispatch] = useReducer(Reducer, {name: '', age: 20});

    return (
        <Provider value={{state, dispatch}}>
            <div>App</div>
            <Child />
        </Provider>
    );
}

export default App;
