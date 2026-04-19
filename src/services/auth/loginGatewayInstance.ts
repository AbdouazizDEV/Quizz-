import type { ILoginGateway } from './ILoginGateway';
import { ApiLoginGateway } from './ApiLoginGateway';

export const loginGateway: ILoginGateway = new ApiLoginGateway();
