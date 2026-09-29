
export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
  errors: string[] | null;
  timestampUtc: string;
}


export const UserRoleValue = {
  Customer: 1,
  Artisan: 2,
  Admin: 3,
} as const;

export type UserRoleValue = (typeof UserRoleValue)[keyof typeof UserRoleValue];
