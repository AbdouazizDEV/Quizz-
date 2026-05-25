import type { PersonalInfoFormValues, PersonalInfoUpdatePayload } from '@app-types/personalInfo.types';

export interface IPersonalInfoPort {
  load(): Promise<PersonalInfoFormValues>;
  save(patch: PersonalInfoUpdatePayload): Promise<PersonalInfoFormValues>;
}
