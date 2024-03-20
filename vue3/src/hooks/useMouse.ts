import { effectScope, onScopeDispose, ref } from "vue";

function useMouse(){
    const x = ref(0);
    const y = ref(0);

    const updateMouse = (e: MouseEvent) => {
        x.value = e.pageX;
        y.value = e.pageY;
    }

    window.addEventListener('mousemove', updateMouse);

    onScopeDispose(()=>{
        window.removeEventListener('mousemove', updateMouse);
    });

    return {x,y}
}

function createSharedComposable(composable){
    let state;
    let scope;
    let subscribers = 0;

    const dispose = ()=>{
        if(scope && --subscribers <= 0){
            scope.stop();
            state = scope = null;
        }
    }

    return (...args)=>{
        subscribers++;
        if(!state){
            scope = effectScope(true);
            state = scope.run(()=> composable(...args));
        }
        onScopeDispose(dispose);
        return state;
    }
}

const useShareMouse = createSharedComposable(useMouse);
export default useShareMouse;