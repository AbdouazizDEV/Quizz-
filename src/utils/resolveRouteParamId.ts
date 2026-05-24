/** Normalise un paramètre expo-router (string | string[] | undefined). */
export function resolveRouteParamId(
  value: string | string[] | undefined,
): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0]?.trim() ?? '';
  return '';
}
