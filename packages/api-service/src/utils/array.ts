export const hasValue = <TValue>(
  value: TValue | null | undefined,
): value is TValue => {
  return !!value
}
