<template>
  <div>
    <div>
      <button @click="prev">上一步</button>
      <button @click="next">下一步</button>
    </div>
    <div class="wrap">
      <transition :name="direction" mod="in-out">
        <component :is="stepComponent"></component>
      </transition>
    </div>
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
      direction: "slide-right",
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
        this.direction = "slide-left";
        this.step -= 1;
      }
    },
    next() {
      if (this.step <= 2) {
        this.direction = "slide-right";
        this.step += 1;
      }
    },
  },
};
</script>

<style scoped>
.wrap {
  width: 400px;
  height: 600px;
  overflow: hidden;
  position: relative;
  margin-top: 24px;
}

/**
 * @description: slide-left
 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.5s ease-out;
}

.slide-left-enter {
  position: absolute;
  transform: translateX(-100%);
  opacity: 0;
}

.slide-left-leave-to {
  position: absolute;
  transform: translateX(100%);
  opacity: 0;
}

/**
 * @description: slide-right
 */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.5s ease-out;
}

.slide-right-enter {
  position: absolute;
  transform: translateX(100%);
  opacity: 0;
}

.slide-right-leave-to {
  position: absolute;
  transform: translateX(-100%);
  opacity: 0;
}
</style>
