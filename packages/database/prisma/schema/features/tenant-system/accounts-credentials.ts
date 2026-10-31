import { Injectable } from "@nestjs/common";
import { AccountsService } from "./access-control/accounts/index.js";
import type {
  CredentialAccount,
  CredentialsPort,
  PasswordChangeOutcome,
} from "./access-control/tenant-auth/index.js";

/**
 * Composition adapter: the sign-in feature asks for credentials through its
 * own port, and this class maps that onto the account owner's public service.
 */
@Injectable()
export class AccountsCredentials implements CredentialsPort {
  constructor(private readonly accounts: AccountsService) {}

  verify(
    username: string,
    password: string,
  ): Promise<CredentialAccount | null> {
    return this.accounts.verify(username, password);
  }

  account(accountId: string): Promise<CredentialAccount | null> {
    return this.accounts.credential(accountId);
  }

  count(): Promise<number> {
    return this.accounts.count();
  }

  changePassword(
    accountId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<PasswordChangeOutcome> {
    return this.accounts.changeOwnPassword(
      accountId,
      currentPassword,
      newPassword,
    );
  }

  markSignedIn(accountId: string): Promise<void> {
    return this.accounts.markSignedIn(accountId);
  }
}
