import usePolling from './usePolling'
import usePreparePolling from './usePreparePolling'

export default function useHandlePolling(
  sendDataRequest: () => Promise<{ data: { status: number } }>,
  getResultRequest: () => Promise<{ data: { status: number } }>,
  finishedCallback: () => void
) {
  return async function () {
    await sendDataRequest()
    const preparePolling = usePreparePolling(getResultRequest, finishedCallback)
    const [startPolling] = usePolling(preparePolling)
    startPolling()
  }
}
