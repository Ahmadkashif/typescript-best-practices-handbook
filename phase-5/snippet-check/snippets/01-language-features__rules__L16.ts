export const Status = { Active: 'active', Disabled: 'disabled' } as const;
export type Status = (typeof Status)[keyof typeof Status];

export function label(s: Status): string {
  switch (s) {
    case Status.Active: return 'Active';
    case Status.Disabled: return 'Disabled';
  }
}
export {};
