import { reactive } from "vue"

export const state = reactive({
    count: 0,
    setCount(){
        this.count++;
    }
})