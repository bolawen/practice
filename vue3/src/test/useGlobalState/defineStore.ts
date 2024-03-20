import { effectScope } from "vue";

function defineStore(setup){
    let state;
    let isChange = false;
    const scope = effectScope(true);
    return ()=>{
        if(!isChange){
            state = scope.run(setup);
            isChange = true;
        }
        return state;
    }
}

export default defineStore;