export const countReducer = (state=0, action)=>{
    switch(action.type){
        case "add":
        return state+action.data;
        case "min":
        return state-action.data;
        default:
        return state;
    }
}

export const usernameReducer = (state='柏拉文', action)=>{
    switch(action.type){
        case "change":
        return action.data;
        default:
        return state;
    }
}