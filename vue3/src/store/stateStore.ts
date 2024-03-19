import { computed, ref } from "vue";
import { defineStore } from "../pinia";

export const useStateStore = defineStore("state", () => {
  const state = ref<{ name: string }>({ name: "" });
  const computedStateName = computed(() => state.value.name + "计算属性");

  function updateState(newState: any) {
    state.value = newState;
  }

  return { state, computedStateName, updateState };
});
