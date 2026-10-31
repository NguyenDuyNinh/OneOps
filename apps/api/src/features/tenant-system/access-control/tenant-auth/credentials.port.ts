export const CREDENTIALS = Symbol("oneops:credentials");

/**
 * Narrow contract the sign-in feature needs from the account owner.
 * The implementation is composed in `tenant-system.module.ts`, so neither
 * feature imports the other.
 */
export interface CredentialAccount {
  accountId: string;
  username: string;
  displayName: string;
  employeeCode: string;
  role: "EMPLOYEE" | "MANAGER";
  isSystemAdmin: boolean;
  status: "ACTIVE" | "LOCKED";
  lockedReason: string;
  mustChangePassword: boolean;
}

export type PasswordChangeOutcome = "CHANGED" | "WRONG_PASSWORD" | "MISSING";

export interface CredentialsPort {
  verify(username: string, password: string): Promise<CredentialAccount | null>;
  account(accountId: string): Promise<CredentialAccount | null>;
  count(): Promise<number>;
  changePassword(
    accountId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<PasswordChangeOutcome>;
  markSignedIn(accountId: string): Promise<void>;
}
