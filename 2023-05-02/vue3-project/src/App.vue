<template>
  <div></div>
</template>

<script setup lang="ts">
import usePolling from './composables/usePolling'
import usePreparePolling from './composables/usePreparePolling'

function sendData(): Promise<{ data: { status: number } }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('sendData')
      resolve({ data: { status: 1 } })
    }, 2000)
  })
}

function getResult(): Promise<{ data: { status: number } }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('getResult')
      resolve({ data: { status: 0 } })
    }, 2000)
  })
}

function finishedCallback() {
  console.log('接口完成啦')
}

await sendData()

const preparePolling = usePreparePolling(getResult, finishedCallback)
const [startPolling] = usePolling(preparePolling)

startPolling()
</script>
