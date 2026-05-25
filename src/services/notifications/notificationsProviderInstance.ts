import { ApiNotificationsProvider } from '@services/notifications/ApiNotificationsProvider';
import type { INotificationsPort } from '@services/notifications/INotificationsPort';

let instance: INotificationsPort = new ApiNotificationsProvider();

export function getNotificationsProvider(): INotificationsPort {
  return instance;
}
