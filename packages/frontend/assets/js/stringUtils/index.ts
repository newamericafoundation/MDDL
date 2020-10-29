export function capitalize(input: string) {
  return !!input && input.length
    ? input.charAt(0).toUpperCase() + input.slice(1)
    : ''
}
