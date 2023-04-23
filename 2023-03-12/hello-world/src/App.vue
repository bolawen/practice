<template>
  <div>
    <AComp ref="aComp">
      <template v-slot:body1="slotProps1">
        {{ slotProps1.body1Info.text }}
      </template>
      <template v-slot:body2="slotProps2">
        {{ slotProps2.body2Info.text }}
      </template>
    </AComp>
  </div>
</template>

<script>
import AComp from "./aComp.vue";

export default {
  name: "App",
  components: { AComp },
};
</script>
