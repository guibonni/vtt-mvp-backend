export function getRequiredParam(
  value: string | string[] | undefined,
  name: string,
): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Parametro invalido: ${name}`);
  }

  return value;
}
