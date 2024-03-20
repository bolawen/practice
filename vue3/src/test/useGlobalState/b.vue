<template>
    <div class="b">
        <h3> B 组件</h3>
        {{  count }}
        {{  doubleCount }}
    </div>
</template>

<script lang="ts" setup>
import useGlobalState from "./store";

const { count, doubleCount, updateCont } = useGlobalState();
</script>