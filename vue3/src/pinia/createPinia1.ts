import { effectScope, markRaw, ref } from "vue";

const SymbolPinia = Symbol('pinia');

function createPinia(){
    let scope = effectScope(true);
    let state = scope.run(()=> ref({}));

    const pinia = markRaw({
        instanll(app){
            pinia._a = app;
            app.provide(SymbolPinia, pinia);
        },
        state,
        _a: null,
        _e: scope,
        _s: new Map()
    });
}

export default createPinia;