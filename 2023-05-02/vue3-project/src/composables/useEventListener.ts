import { onMounted, onUnmounted } from 'vue'

export function useEventListener(target: any, event: string, callback: (e: any) => void) {
  onMounted(() => {
    target.addEventListener(event, callback)
  })
  onUnmounted(() => {
    target.removeEventListener(event, callback)
  })
}
