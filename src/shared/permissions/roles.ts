export type UserRole = 'super_admin' | 'org_admin' | 'manager' | 'employee'

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 4,
  org_admin: 3,
  manager: 2,
  employee: 1,
}

export const ROLE_HOME: Record<UserRole, string> = {
  employee: '/e',
  manager: '/m',
  org_admin: '/admin',
  super_admin: '/admin',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  org_admin: 'Organization Admin',
  manager: 'Manager',
  employee: 'Employee',
}

/**
 * Check whether a user with `userRole` meets the minimum `requiredRole` level.
 */
export function canAccess(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}
