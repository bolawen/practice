import { onUnmounted, ref, watch } from 'vue'

export default function usePolling(
  cb: () => Promise<boolean>,
  timeout = 1000
): [startPolling: () => void, endPolling: () => void] {
  const countTime = ref(0)
  const timer: any = ref(null)

  const stopWatch = watch(countTime, () => {
    if (countTime.value > 0) {
      clearTimeout(timer.value)
      timer.value = setTimeout(() => {
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
