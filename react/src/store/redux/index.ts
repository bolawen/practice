import { combineReducers, createStore } from "redux";
import { countReducer, usernameReducer } from "./reducer";

const reducer = combineReducers({
    count:countReducer,
    username:usernameReducer
});

const store = createStore(reducer)
export default store;