import { AsyncStorageAccountRegistrationPersistence, ExpoAuthTokenPersistence } from './authPersistence';
import { DefaultAuthSessionService } from './DefaultAuthSessionService';
import type { IAuthSessionService } from './IAuthSessionService';

const tokenPersistence = new ExpoAuthTokenPersistence();
const accountPersistence = new AsyncStorageAccountRegistrationPersistence();

export const authSessionService: IAuthSessionService = new DefaultAuthSessionService(
  tokenPersistence,
  accountPersistence,
);
