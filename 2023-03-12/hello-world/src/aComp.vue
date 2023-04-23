<template>
  <div>
    <h3>A 组件 Header</h3>
    <slot name="body1" :slotProps1="body1Info"></slot>
    <slot name="body2" :slotProps2="body2Info"></slot>
    <slot name="body3">A 组件 Body3 默认内容</slot>
    <p>A 组件 Footer</p>
  </div>
</template>

<script>

export default {
  name: "AComp",
  data(){
    return {
      body1Info:{
        text: "哈哈哈"
      },
      body2Info:{
        text: "嘻嘻嘻"
      }
    }
  }
};
</script>
