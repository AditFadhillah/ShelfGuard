export const ROLES = ['Admin', 'Viewer'] as const;
export type Role = (typeof ROLES)[number];

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
}
