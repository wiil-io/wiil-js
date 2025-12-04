# Reservation Management Guide

This guide covers managing reservation resources (tables, rooms, rentals) and customer reservations using the WIIL Platform JS SDK.

## Quick Start

```typescript
import { WiilClient, ResourceType, AppointmentStatus, ResourceReservationDurationUnit } from 'wiil-js';

const client = new WiilClient({
  apiKey: 'your-api-key',
});

// Create a table resource
const table = await client.reservationResources.create({
  resourceType: ResourceType.TABLE,
  name: 'Table 5',
  description: 'Window-side table for 4 guests',
  capacity: 4,
  isAvailable: true,
  location: 'Main dining area',
  amenities: ['Window view', 'Booth seating'],
  reservationDuration: 2,
  reservationDurationUnit: ResourceReservationDurationUnit.HOURS,
  syncEnabled: false,
});

// Create a reservation for the table
const reservation = await client.reservations.create({
  reservationType: ResourceType.TABLE,
  resourceId: table.id,
  customerId: 'cust_123',
  startTime: Date.now() + 3600000, // 1 hour from now
  endTime: Date.now() + 7200000,   // 2 hours from now
  duration: 2,
  personsNumber: 4,
  totalPrice: 0,
  depositPaid: 0,
  notes: 'Window table preferred',
  isResourceReservation: true,
});
```

## Reservation Resources

Reservation resources represent bookable items such as restaurant tables, hotel rooms, conference rooms, or rental equipment.

### Resource Types

```typescript
enum ResourceType {
  TABLE = 'table',        // Restaurant/dining tables
  ROOM = 'room',          // Hotel rooms/accommodations
  RENTALS = 'rentals',    // Rental items/spaces
  RESOURCE = 'resource'   // Generic resources
}
```

### Duration Units

```typescript
enum ResourceReservationDurationUnit {
  MINUTES = 'minutes',
  HOURS = 'hours',
  NIGHTS = 'nights'
}
```

### Resource Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| resourceType | string | Yes | Type: 'table', 'room', 'rentals', 'resource' |
| name | string | Yes | Resource name |
| description | string | No | Resource description |
| capacity | number | No | Maximum capacity (people) |
| isAvailable | boolean | No | Available for reservation (default: true) |
| location | string | No | Physical location |
| amenities | string[] | No | Available amenities (default: []) |
| reservationDuration | number | No | Default reservation duration |
| reservationDurationUnit | string | No | Unit: 'minutes', 'hours', 'nights' |
| calendarId | string | No | Calendar ID for sync |
| syncEnabled | boolean | No | Enable calendar sync (default: false) |
| roomResource | object | No | Room-specific fields (for ROOM type) |
| rentalResource | object | No | Rental-specific fields (for RENTALS type) |

### Create Table Resource

```typescript
const table = await client.reservationResources.create({
  resourceType: ResourceType.TABLE,
  name: 'Table 10',
  description: 'Private dining table',
  capacity: 6,
  isAvailable: true,
  location: 'Private room',
  amenities: ['Privacy screen', 'Premium seating'],
  reservationDuration: 2,
  reservationDurationUnit: ResourceReservationDurationUnit.HOURS,
  syncEnabled: false,
});

console.log('Table created:', table.id);
```

### Create Room Resource

```typescript
const room = await client.reservationResources.create({
  resourceType: ResourceType.ROOM,
  name: 'Room 101',
  description: 'Deluxe ocean view suite',
  capacity: 2,
  isAvailable: true,
  location: 'Building A, Floor 1',
  amenities: ['WiFi', 'Mini-bar', 'Ocean view', 'King bed'],
  reservationDuration: 1,
  reservationDurationUnit: ResourceReservationDurationUnit.NIGHTS,
  syncEnabled: false,
  roomResource: {
    roomNumber: '101',
    roomType: 'Deluxe King',
    pricePerNight: 299.99,
    view: 'Ocean View',
    bedType: 'King',
    isSmoking: false,
    accessibilityFeatures: 'Roll-in shower, Grab bars',
  },
});

console.log('Room created:', room.id);
console.log('Price per night:', room.roomResource.pricePerNight);
```

### Create Rental Resource

```typescript
const conferenceRoom = await client.reservationResources.create({
  resourceType: ResourceType.RENTALS,
  name: 'Conference Room A',
  description: 'Large conference room with projector',
  capacity: 12,
  isAvailable: true,
  location: 'Floor 2',
  amenities: ['Projector', 'Whiteboard', 'Video-conference'],
  reservationDuration: 1,
  reservationDurationUnit: ResourceReservationDurationUnit.HOURS,
  syncEnabled: false,
  rentalResource: {
    itemType: 'Conference Room',
    pricePerHour: 50.00,
  },
});

console.log('Conference room created:', conferenceRoom.id);
console.log('Hourly rate:', conferenceRoom.rentalResource.pricePerHour);
```

### Create Resource with Calendar Sync

```typescript
const room = await client.reservationResources.create({
  resourceType: ResourceType.ROOM,
  name: 'Room 202',
  capacity: 2,
  isAvailable: true,
  amenities: [],
  reservationDuration: 1,
  reservationDurationUnit: ResourceReservationDurationUnit.NIGHTS,
  calendarId: 'google-calendar-123',
  syncEnabled: true,
});

console.log('Calendar sync enabled:', room.syncEnabled);
console.log('Last sync:', room.lastSyncAt);
```

### Get Resource

```typescript
const resource = await client.reservationResources.get('resource_123');

console.log('Resource:', resource.name);
console.log('Type:', resource.resourceType);
console.log('Capacity:', resource.capacity);
console.log('Available:', resource.isAvailable);
```

### Get Resources by Type

```typescript
const tables = await client.reservationResources.getByType(ResourceType.TABLE, {
  page: 1,
  pageSize: 20,
});

console.log('Tables:', tables.data.length);
tables.data.forEach(table => {
  console.log('-', table.name, `(capacity: ${table.capacity})`);
});
```

### Update Resource

```typescript
const updated = await client.reservationResources.update({
  id: 'resource_123',
  name: 'Table 5 (VIP)',
  capacity: 6,
  description: 'Expanded VIP table',
  isAvailable: true,
});

console.log('Updated:', updated.name);
```

### Update Resource Availability

```typescript
const updated = await client.reservationResources.update({
  id: 'resource_456',
  isAvailable: false,
});

console.log('Now unavailable');
```

### Update Room Pricing

```typescript
const updated = await client.reservationResources.update({
  id: 'resource_room',
  roomResource: {
    roomNumber: '101',
    roomType: 'Deluxe King',
    pricePerNight: 349.99,
    view: 'Ocean View',
    bedType: 'King',
    isSmoking: false,
  },
});

console.log('New price:', updated.roomResource.pricePerNight);
```

### Delete Resource

```typescript
const deleted = await client.reservationResources.delete('resource_123');

console.log('Deleted:', deleted);
```

### List Resources

```typescript
const result = await client.reservationResources.list({
  page: 1,
  pageSize: 20,
});

console.log('Resources:', result.data.length);
console.log('Total:', result.meta.totalCount);
```

## Reservations

Reservations represent customer bookings for specific resources.

### Reservation Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reservationType | string | Yes | Type: 'table', 'room', 'rentals', 'resource' |
| resourceId | string | No | Resource ID (nullable) |
| customerId | string | Yes | Customer ID |
| startTime | number | Yes | Start time (Unix timestamp) |
| endTime | number | No | End time (Unix timestamp) |
| duration | number | No | Duration based on resource type |
| personsNumber | number | No | Number of people |
| totalPrice | number | No | Total price |
| depositPaid | number | No | Deposit paid (default: 0) |
| notes | string | No | Special requests or notes |
| isResourceReservation | boolean | No | Specific resource (default: true) |

Note: Status defaults to 'pending' and should not be included in create requests.

### Create Table Reservation

```typescript
const reservation = await client.reservations.create({
  reservationType: ResourceType.TABLE,
  resourceId: 'resource_table5',
  customerId: 'cust_123',
  startTime: Date.now() + 3600000,
  endTime: Date.now() + 7200000,
  duration: 2,
  personsNumber: 4,
  totalPrice: 0,
  depositPaid: 0,
  notes: 'Window table preferred',
  isResourceReservation: true,
});

console.log('Reservation created:', reservation.id);
console.log('Status:', reservation.status);
```

### Create Room Reservation with Deposit

```typescript
const reservation = await client.reservations.create({
  reservationType: ResourceType.ROOM,
  resourceId: 'resource_room101',
  customerId: 'cust_456',
  startTime: Date.now(),
  endTime: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 nights
  duration: 3,
  personsNumber: 2,
  totalPrice: 899.97,
  depositPaid: 299.99,
  notes: 'Early check-in requested',
  isResourceReservation: true,
});

console.log('Reservation created:', reservation.id);
console.log('Total price:', reservation.totalPrice);
console.log('Deposit paid:', reservation.depositPaid);
```

### Create Rental Reservation

```typescript
const reservation = await client.reservations.create({
  reservationType: ResourceType.RENTALS,
  resourceId: 'resource_confroom',
  customerId: 'cust_789',
  startTime: Date.now(),
  endTime: Date.now() + 4 * 60 * 60 * 1000, // 4 hours
  duration: 4,
  personsNumber: 10,
  totalPrice: 200.00,
  depositPaid: 0,
  isResourceReservation: true,
});

console.log('Conference room reserved:', reservation.id);
```

### Create General Availability Reservation

Without a specific resource (capacity-based):

```typescript
const reservation = await client.reservations.create({
  reservationType: ResourceType.TABLE,
  customerId: 'cust_999',
  startTime: Date.now(),
  duration: 1,
  personsNumber: 2,
  totalPrice: 0,
  depositPaid: 0,
  isResourceReservation: false, // No specific resource
});

console.log('General reservation created:', reservation.id);
console.log('Resource ID:', reservation.resourceId); // undefined
```

### Get Reservation

```typescript
const reservation = await client.reservations.get('reservation_123');

console.log('Reservation:', reservation.id);
console.log('Status:', reservation.status);
console.log('Persons:', reservation.personsNumber);
console.log('Notes:', reservation.notes);
```

### Get Reservations by Customer

```typescript
const result = await client.reservations.getByCustomer('cust_123', {
  page: 1,
  pageSize: 20,
});

console.log('Customer reservations:', result.data.length);
result.data.forEach(res => {
  console.log('-', new Date(res.startTime), res.reservationType, res.status);
});
```

### Get Reservations by Resource

```typescript
const result = await client.reservations.getByResource('resource_table5', {
  page: 1,
  pageSize: 20,
});

console.log('Resource reservations:', result.data.length);
result.data.forEach(res => {
  console.log('-', new Date(res.startTime), res.personsNumber, 'people');
});
```

### Update Reservation

```typescript
const updated = await client.reservations.update({
  id: 'reservation_123',
  personsNumber: 6,
  notes: 'Updated party size',
});

console.log('Updated:', updated.personsNumber, 'people');
```

### Update Reservation Status

```typescript
const updated = await client.reservations.updateStatus('reservation_123', {
  status: AppointmentStatus.COMPLETED,
});

console.log('Status updated:', updated.status);
```

### Cancel Reservation

```typescript
const cancelled = await client.reservations.cancel('reservation_123', {
  reason: 'Customer requested cancellation',
});

console.log('Cancelled:', cancelled.status);
console.log('Reason:', cancelled.cancelReason);
```

### Reschedule Reservation

```typescript
const newStartTime = Date.now() + 24 * 60 * 60 * 1000; // Tomorrow
const newEndTime = newStartTime + 2 * 60 * 60 * 1000;  // 2 hours later

const rescheduled = await client.reservations.reschedule('reservation_123', {
  startTime: newStartTime.toString(),
  endTime: newEndTime.toString(),
});

console.log('Rescheduled to:', new Date(rescheduled.startTime));
```

### Reschedule with Different Resource

```typescript
const newStartTime = Date.now() + 24 * 60 * 60 * 1000;
const newEndTime = newStartTime + 2 * 60 * 60 * 1000;

const rescheduled = await client.reservations.reschedule('reservation_123', {
  startTime: newStartTime.toString(),
  endTime: newEndTime.toString(),
  resourceId: 'resource_table10', // Different table
});

console.log('Moved to:', rescheduled.resourceId);
```

### Delete Reservation

```typescript
const deleted = await client.reservations.delete('reservation_123');

console.log('Deleted:', deleted);
```

### List Reservations

```typescript
const result = await client.reservations.list({
  page: 1,
  pageSize: 20,
});

console.log('Reservations:', result.data.length);
console.log('Total:', result.meta.totalCount);
```

## Reservation Settings

Configure default reservation behaviors for each resource type.

### Setting Types

```typescript
enum ReservationSettingType {
  CAPACITY = 'capacity',              // Capacity-based (no specific resource)
  RESOURCE_SPECIFIC = 'resource_specific'  // Specific resource required
}
```

### Settings Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reservationType | string | Yes | Type: 'table', 'room', 'rentals', 'resource' |
| settingType | string | Yes | 'capacity' or 'resource_specific' |
| defaultReservationDuration | number | No | Default duration |
| defaultReservationDurationUnit | string | No | Unit: 'minutes', 'hours', 'nights' |
| isActive | boolean | No | Setting is active (default: true) |

### Get Settings

```typescript
const settings = await client.reservations.getSettings();

console.log('Settings:', settings.length);
settings.forEach(setting => {
  console.log('-', setting.reservationType, setting.defaultReservationDuration, setting.defaultReservationDurationUnit);
});
```

### Update Settings

```typescript
const updated = await client.reservations.updateSettings({
  id: 'settings_123',
  defaultReservationDuration: 3,
  isActive: false,
});

console.log('Settings updated:', updated.defaultReservationDuration);
```

### Delete Settings

```typescript
const deleted = await client.reservations.deleteSettings('settings_123');

console.log('Deleted:', deleted);
```

## Reservation Status Values

```typescript
enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show'
}
```

## Complete Example: Restaurant Reservation System

```typescript
import { WiilClient, ResourceType, AppointmentStatus, ResourceReservationDurationUnit } from 'wiil-js';

async function setupRestaurantReservations() {
  const client = new WiilClient({
    apiKey: process.env.WIIL_API_KEY!,
  });

  // 1. Create table resources
  const table2 = await client.reservationResources.create({
    resourceType: ResourceType.TABLE,
    name: 'Table 2',
    description: 'Cozy corner table',
    capacity: 2,
    isAvailable: true,
    location: 'Corner area',
    amenities: ['Quiet', 'Intimate'],
    reservationDuration: 2,
    reservationDurationUnit: ResourceReservationDurationUnit.HOURS,
    syncEnabled: false,
  });

  const table4 = await client.reservationResources.create({
    resourceType: ResourceType.TABLE,
    name: 'Table 4',
    description: 'Family table',
    capacity: 4,
    isAvailable: true,
    location: 'Main dining area',
    amenities: ['High chairs available'],
    reservationDuration: 2,
    reservationDurationUnit: ResourceReservationDurationUnit.HOURS,
    syncEnabled: false,
  });

  const table6 = await client.reservationResources.create({
    resourceType: ResourceType.TABLE,
    name: 'Table 6',
    description: 'Large party table',
    capacity: 6,
    isAvailable: true,
    location: 'Private room',
    amenities: ['Privacy screen', 'Wine pairing available'],
    reservationDuration: 2,
    reservationDurationUnit: ResourceReservationDurationUnit.HOURS,
    syncEnabled: false,
  });

  console.log('Created 3 tables');

  // 2. Create reservation for tonight
  const tonight7pm = new Date();
  tonight7pm.setHours(19, 0, 0, 0);
  const tonight9pm = new Date();
  tonight9pm.setHours(21, 0, 0, 0);

  const reservation = await client.reservations.create({
    reservationType: ResourceType.TABLE,
    resourceId: table4.id,
    customerId: 'cust_smith',
    startTime: tonight7pm.getTime(),
    endTime: tonight9pm.getTime(),
    duration: 2,
    personsNumber: 4,
    totalPrice: 0,
    depositPaid: 0,
    notes: 'Anniversary dinner - please decorate table',
    isResourceReservation: true,
  });

  console.log('Reservation created:', reservation.id);
  console.log('Table:', table4.name);
  console.log('Time:', new Date(reservation.startTime).toLocaleString());

  // 4. Confirm the reservation
  await client.reservations.updateStatus(reservation.id, {
    status: AppointmentStatus.CONFIRMED,
  });

  console.log('Reservation confirmed');

  // 4. Customer needs to reschedule
  const tomorrow7pm = new Date(tonight7pm);
  tomorrow7pm.setDate(tomorrow7pm.getDate() + 1);
  const tomorrow9pm = new Date(tonight9pm);
  tomorrow9pm.setDate(tomorrow9pm.getDate() + 1);

  const rescheduled = await client.reservations.reschedule(reservation.id, {
    startTime: tomorrow7pm.getTime().toString(),
    endTime: tomorrow9pm.getTime().toString(),
  });

  console.log('Rescheduled to:', new Date(rescheduled.startTime).toLocaleString());

  // 5. Check all reservations for a resource
  const table4Reservations = await client.reservations.getByResource(table4.id);

  console.log(`Table 4 has ${table4Reservations.data.length} reservations`);
  table4Reservations.data.forEach(res => {
    console.log('-', new Date(res.startTime).toLocaleString(), res.personsNumber, 'people', res.status);
  });

  // 6. Complete the reservation
  await client.reservations.updateStatus(rescheduled.id, {
    status: AppointmentStatus.COMPLETED,
  });

  console.log('Reservation completed');

  // 7. Get customer reservation history
  const customerHistory = await client.reservations.getByCustomer('cust_smith');

  console.log(`Customer has ${customerHistory.data.length} reservations`);
}
```

## Best Practices

### Resource Management
- Set appropriate capacities for each resource
- Use descriptive names and locations
- Keep amenities lists up to date
- Set realistic reservation durations
- Use calendar sync for external booking systems

### Reservation Handling
- Always validate resource availability before creating reservations
- Include customer notes for special requests
- Use deposits for high-value bookings (rooms, special events)
- Confirm reservations promptly
- Send reminders before reservation time

### Resource Type Guidelines

**Tables (Restaurants):**
- Duration: hours
- Track capacity (number of seats)
- Include location for customer preference
- List amenities (window view, booth, etc.)

**Rooms (Hotels):**
- Duration: nights
- Use roomResource for detailed info
- Track pricing per night
- Include bed type and view information
- Note accessibility features

**Rentals (Equipment/Spaces):**
- Duration: hours or minutes
- Use rentalResource for hourly rates
- List available equipment/amenities
- Include capacity for spaces

### Status Management
Follow this typical lifecycle:
1. Reservation created → 'pending'
2. Confirmed by business → 'confirmed'
3. Customer arrives → (reservation active)
4. Service complete → 'completed'
5. Or cancelled → 'cancelled'
6. Or no-show → 'no_show'

## Troubleshooting

### Problem: Resource not available

**Error:**
```
ValidationError: Resource is not available for reservation
```

**Solution:**
Check resource availability and update if needed:
```typescript
const resource = await client.reservationResources.get('resource_123');
if (!resource.isAvailable) {
  await client.reservationResources.update({
    id: 'resource_123',
    isAvailable: true,
  });
}
```

### Problem: Missing customer ID

**Error:**
```
ValidationError: customerId is required
```

**Solution:**
Always provide a valid customer ID:
```typescript
const reservation = await client.reservations.create({
  reservationType: ResourceType.TABLE,
  customerId: 'cust_123', // Required
  // ... other fields
});
```

### Problem: Invalid reservation type

**Error:**
```
ValidationError: Invalid reservation type
```

**Solution:**
Use ResourceType enum values:
```typescript
import { ResourceType } from 'wiil-js';

const reservation = await client.reservations.create({
  reservationType: ResourceType.TABLE, // or ROOM, RENTALS, RESOURCE
  // ... other fields
});
```

### Problem: Resource type mismatch

**Error:**
Resource and reservation types don't match

**Solution:**
Ensure reservation type matches resource type:
```typescript
const resource = await client.reservationResources.get('resource_123');

const reservation = await client.reservations.create({
  reservationType: resource.resourceType, // Match the resource type
  resourceId: resource.id,
  // ... other fields
});
```
