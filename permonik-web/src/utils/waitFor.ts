export const waitFor = async (
  conditionFn: () => boolean,
  timeout = 5000
): Promise<void> => {
  const interval = 50
  const start = Date.now()

  return new Promise((resolve, reject) => {
    const checkCondition = () => {
      if (conditionFn()) {
        resolve()
      } else if (Date.now() - start > timeout) {
        reject(new Error('Timeout waiting for condition'))
      } else {
        setTimeout(checkCondition, interval)
      }
    }

    checkCondition()
  })
}
