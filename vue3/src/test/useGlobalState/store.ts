import { computed, ref } from "vue";
import defineGlobalStore from "./defineStore";

const useStore = defineGlobalStore(() => {
  const count = ref(0);
  const doubleCount = computed(() => count.value * 2);
  const updateCount = () => {
    count.value++;
  };
  return { count, doubleCount, updateCount };
});

export default useStore;
