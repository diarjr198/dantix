import { UserModel } from '@/server/models/user';
import { OrganizerModel } from '@/server/models/organizer';
import { EventModel } from '@/server/models/event';
import { TicketTypeModel } from '@/server/models/ticket-type';
import { SiteSettingsModel } from '@/server/models/site-settings';
import { FaqModel } from '@/server/models/faq';
import {
  CheckinModel,
  CheckinSessionModel,
  EventStaffModel,
  OrderItemModel,
  OrderModel,
  PaymentModel,
  TicketModel,
} from '@/server/models/transaction-models';

export const databaseModels = [
  UserModel,
  OrganizerModel,
  EventModel,
  TicketTypeModel,
  SiteSettingsModel,
  FaqModel,
  OrderModel,
  OrderItemModel,
  PaymentModel,
  TicketModel,
  CheckinSessionModel,
  EventStaffModel,
  CheckinModel,
];
