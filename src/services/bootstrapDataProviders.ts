import { ApiProfileDataProvider } from '@services/profile/ApiProfileDataProvider';
import { setProfileDataProvider } from '@services/profile/profileDataProviderInstance';
import { ApiStatisticsDataProvider } from '@services/statistics/ApiStatisticsDataProvider';
import { setStatisticsDataProvider } from '@services/statistics/statisticsDataProviderInstance';

setProfileDataProvider(new ApiProfileDataProvider());
setStatisticsDataProvider(new ApiStatisticsDataProvider());
