<template>
    <div class="b">
        <h3> C 组件</h3>
        {{  count }}
        {{  doubleCount }}
        <button @click="updateCount">C 组件 Update</button>
    </div>
</template>

<script lang="ts" setup>
import useGlobalState from "./store";

const { count, doubleCount, updateCount } = useGlobalState();
</script>