<template>
  <div>
    {{  a }}
    <RemoteButton>按钮</RemoteButton>
  </div>
</template>

<script setup lang="ts">
import { a } from 'remoteApp/utils';
import RemoteButton from 'remoteApp/Button';
</script>
