export const handleError = (reason: unknown) =>
  reason instanceof Error ? reason : new Error(String(reason))
