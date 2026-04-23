import type { IPasswordResetGateway } from './IPasswordResetGateway';
import { ApiPasswordResetGateway } from './ApiPasswordResetGateway';

export const passwordResetGateway: IPasswordResetGateway = new ApiPasswordResetGateway();
