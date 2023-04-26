<template>
  <div>
    <div>
      <button @click="prev">上一步</button>
      <button @click="next">下一步</button>
    </div>
    <keep-alive>
      <component :is="stepComponent"></component>
    </keep-alive>
  </div>
</template>

<script>
import Step1 from "./step1.vue";
import Step2 from "./step2.vue";
import Step3 from "./step3.vue";

export default {
  name: "App",
  components: {
    Step1,
    Step2,
    Step3,
  },
  data() {
    return {
      step: 1,
    };
  },
  computed: {
    stepComponent() {
      return "step" + this.step;
    },
  },
  methods: {
    prev() {
      if (this.step > 1) {
        this.step -= 1;
      }
    },
    next() {
      this.step += 1;
    },
  },
};
</script>
