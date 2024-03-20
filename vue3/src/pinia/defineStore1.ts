import { getCurrentInstance, inject, reactive } from "vue";
import { SymbolPinia } from "./rootStore";

function createSetupStore(id,setup,pinia){
    let scope;
    const store = reactive({});

    const setupStore = pinia._e.run(()=>{
        scope = effectScope();
        return scope.run(()=> setup());
    });

    for(let key in setupStore){
        const prop = setupStore[key];
        if(typeof prop === "function"){
            setupStore[key] = wrapAction(key,prop);
        }
    }

    Objectd.assing(store,setupStore);
    pinia._s.set(id,store);
    return store;
}

function defineStore(idOrOptions, setup){
    let id;

    const isSetupStore = typeof setup === "function" ? true : false;

    function useStore(){
        const instance = getCurrentInstance();
        const pinia = instance && inject(SymbolPinia);
        if(!pinia._s.has(id)){
            if(isSetupStore){
                createSetupStore(id,setup,pinia);
            }else{
                createOptionsStore();
            }
        }
        const store = pinia._s.get(id);
        return store;
    }
}