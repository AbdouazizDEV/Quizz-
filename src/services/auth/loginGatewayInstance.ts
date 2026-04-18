import type { ILoginGateway } from './ILoginGateway';
import { StubLoginGateway } from './StubLoginGateway';

export const loginGateway: ILoginGateway = new StubLoginGateway();
