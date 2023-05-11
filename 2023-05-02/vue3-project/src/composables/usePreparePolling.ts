export default function usePreparePolling(
  pollRequest: () => Promise<{ data: { status: number } }>,
  finishedCallback: () => void
) {
  return async function () {
    const result = await pollRequest()
    if (!result.data.status) {
      return true
    } else {
      finishedCallback()
      return false
    }
  }
}
