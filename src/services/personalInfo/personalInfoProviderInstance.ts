import { ApiPersonalInfoProvider } from '@services/personalInfo/ApiPersonalInfoProvider';
import type { IPersonalInfoPort } from '@services/personalInfo/IPersonalInfoPort';

let instance: IPersonalInfoPort = new ApiPersonalInfoProvider();

export function getPersonalInfoProvider(): IPersonalInfoPort {
  return instance;
}

export function setPersonalInfoProviderForTests(p: IPersonalInfoPort): void {
  instance = p;
}
