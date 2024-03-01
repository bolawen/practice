<template>
  <div class="tree-item-container">
    <div
      :class="{
        leaf: !isParent,
        parent: isParent,
        'tree-node': true,
        'tree-node-open': isOpen,
        'tree-node-close': !isOpen,
        ['tree-node-' + level]: true,
        'tree-node-last': isLastChild
      }"
      @click="handleToggle"
    >
      <span class="tree-node-indent">
        <span
          :class="{
            'tree-node-indent-unit': true
          }"
          v-for="(unit, unitIndex) in level - 1"
        ></span>
      </span>
      <span
        :class="{
          'tree-node-switcher': true,
          'tree-node-switcher-open': isOpen,
          'tree-node-switcher-close': !isOpen
        }"
      >
        <span
          class="tree-node-switcher-icon"
          v-if="isParent"
          >[{{ isOpen ? '-' : '+' }}]</span
        >
      </span>
      <span class="tree-node-name">{{ data.name }}</span>
    </div>
    <div
      :class="{
        'tree-node-children': true,
        ['tree-node-children-' + level]: true
      }"
      v-if="isParent"
      v-show="isOpen"
    >
      <Tree
        :data="data.children"
        :level="level + 1"
      ></Tree>
    </div>
  </div>
</template>

<script setup>
import Tree from './Tree.vue';
import { ref, computed } from 'vue';

const props = defineProps({
  data: Object,
  level: Number,
  index: Number,
  isLastChild: Boolean,
});

const isOpen = ref(false);

const isParent = computed(() => {
  return props.data.children && props.data.children.length;
});

const handleToggle = () => {
  isOpen.value = !isOpen.value;
};
</script>

<style scoped>
.tree-node {
  display: flex;
  text-align: left;
  align-items: flex-start;
}
.tree-node-indent {
  align-self: stretch;
}
.tree-node-indent-unit {
  width: 24px;
  height: 100%;
  position: relative;
  display: inline-block;
}

.tree-node-switcher {
  flex: none;
  width: 24px;
  cursor: pointer;
  line-height: 24px;
  position: relative;
  align-self: stretch;
  background: transparent;
}
.tree-node-leaf-line {
  width: 100%;
  height: 100%;
  line-height: 24px;
  position: relative;
  text-align: center;
  display: inline-block;
}
</style>
