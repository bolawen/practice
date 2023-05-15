import { computed, ref } from "vue";
import { defineStore } from "pinia"


export const useGlobalState = defineStore('globalState',()=>{
    const a = ref(1);
    const countA = computed(()=>{
        return a.value * 2;
    });

    function setA(value:number){
        a.value += value;
    }

    return { a, countA, setA}
});