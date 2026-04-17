import type { ICountry } from 'rn-country-select';

export function getCountryLabelFr(country: ICountry): string {
  return country.translations?.fra?.common ?? country.name.common;
}
