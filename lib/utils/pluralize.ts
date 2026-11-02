// "1 local", "3 locais". Zero também é plural em português ("0 locais").
export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
