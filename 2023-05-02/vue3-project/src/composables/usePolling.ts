import { onUnmounted, ref, watch } from 'vue'

export default function usePolling(
  cb: () => Promise<boolean>,
  timeout = 1000
): [startPolling: () => void, endPolling: () => void] {
  let timer: any
  const countTime = ref(0)

  const stopWatch = watch(countTime, () => {
    if (countTime.value > 0) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        cb()
          .then((res) => {
            if (res) {
              countTime.value += 1
            }
          })
          .catch(() => {
            countTime.value = 0
          })
      }, timeout)
    }
  })

  onUnmounted(() => {
    stopWatch()
  })

  const startPolling = () => {
    countTime.value += 1
  }
  const endPolling = () => {
    countTime.value = 0
  }

  return [startPolling, endPolling]
}
