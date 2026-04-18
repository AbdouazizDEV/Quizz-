import type { IPasswordResetGateway } from './IPasswordResetGateway';
import { StubPasswordResetGateway } from './StubPasswordResetGateway';

export const passwordResetGateway: IPasswordResetGateway = new StubPasswordResetGateway();
