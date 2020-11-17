export const addDaysFromNow = (days: number) => {
  const result = new Date()
  result.setDate(result.getDate() + days)
  return result
}
