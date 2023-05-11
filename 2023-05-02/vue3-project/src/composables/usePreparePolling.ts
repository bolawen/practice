export default function usePreparePolling(
  getResultRequest: () => Promise<{ data: { status: number } }>,
  finishedCallback: () => void
) {
  return async function () {
    try {
      const result = await getResultRequest()
      if (!result.data.status) {
        return true
      } else {
        finishedCallback()
        return false
      }
    } catch (error: any) {
      return false
    }
  }
}
