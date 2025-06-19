import { UserRole } from './types';

export const APP_NAME = "Class Management Platform";

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Administrator",
  [UserRole.TEACHER]: "Teacher",
  [UserRole.PARENT]: "Parent",
  [UserRole.STUDENT_USER]: "Student User",
};

export const MOCK_ROLE_CODES: Record<string, { userId: string, role: UserRole }> = {
  "ADMIN-123": { userId: "admin001", role: UserRole.ADMIN },
  "TCHR-ABC": { userId: "teacher001", role: UserRole.TEACHER },
  "TCHR-DEF": { userId: "teacher002", role: UserRole.TEACHER },
  "PRNT-XYZ": { userId: "parent001", role: UserRole.PARENT },
  "PRNT-UVW": { userId: "parent002", role: UserRole.PARENT },
  // Example for a student user if they need a code, can be generated dynamically too
  // "STUD-PQR": { userId: "student001", role: UserRole.STUDENT_USER }, 
};

export const DEFAULT_AVATAR_PLACEHOLDER = 'https://picsum.photos/seed/avatar/100/100';