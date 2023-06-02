import { ref } from 'vue'
import { useEventListener } from './useEventListener'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function handle(e: any) {
    x.value = e.pageX
    y.value = e.pageY
  }

  useEventListener(window, 'mousemove', handle)

  return { x, y }
}
