# Database design

## Collections

The database keeps 11 separate collections: `users`, `organizers`, `events`, `ticket_types`, `orders`, `order_items`, `payments`, `tickets`, `checkin_sessions`, `event_staff`, and `checkins`. Every document uses MongoDB's native ObjectId `_id`, camelCase properties, and Mongoose timestamps.

References use ObjectId and `ref`. MongoDB/Mongoose references do not enforce foreign keys. Future application services must verify that referenced documents exist and that related order, ticket type, ticket, session, and staff records belong to the same event.

## Money

All IDR amounts are nonnegative JavaScript safe integers representing whole rupiah. This replaces SQL `NUMERIC` from the preceding ERD. Fractional currency is not supported.

## Indexes

Unique: `users.email`, `orders.bookingCode`, `order_items(orderId, ticketTypeId)`, `payments(provider, providerReference)`, `tickets(orderItemId, ticketSequence)`, `event_staff(eventId, userId)`, and `checkins(sessionId, ticketId)`.

A partial unique `payments.orderId` index applies only to `SUCCEEDED` payments. A partial unique `tickets.qrTokenHash` index applies only when the value is a string, allowing multiple tickets without QR values. Reference fields are indexed, and orders use `(eventId, status, expiresAt)`. There is intentionally no TTL index on `orders.expiresAt`; transaction history must remain stored.

## Validation boundaries

Document validation checks local fields and invariants, including date order, safe integer amounts, order totals, line totals, payment completion, and ticket QR state. It does not guarantee aggregate values or cross-collection relationships. Mongoose document middleware may not run for direct update operations; later write services must use suitable update validators or load and save documents.

## Deferred business rules

These requirements belong to later application services and are not implemented in this foundation:

- One order contains ticket types from one event only.
- A ticket category must belong to the order event.
- Tickets, check-in sessions, and staff must belong to the same event.
- Prices and contact details on orders are immutable purchase snapshots.
- Issued ticket count after confirmation must match item quantity.
- Payments require verified, idempotent processing.
- Quota reservation requires a purpose-built atomic MongoDB operation.
- Multi-document transactions require a MongoDB deployment that supports transactions.
- Staff must be active and authorized for the operation.
- A ticket can check in only once per session; the unique index is the final database guard.
- Free events can complete without a Payment document.
- Login and payment are not mandatory steps for every order.

MongoDB does not provide SQL foreign keys or `SELECT FOR UPDATE`; later implementation must use MongoDB-native atomic operations and transactions where appropriate.
