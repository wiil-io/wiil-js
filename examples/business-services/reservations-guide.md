# Reservation Management Guide

**Manage table, room, and rental reservations using the WIIL Platform JS SDK**

**Setup Time**: ~15 minutes

---

## Overview

The WIIL Platform provides three distinct reservation systems, each with specialized features:

| Type | Use Case | Duration Unit | Key Fields |
|------|----------|---------------|------------|
| **Table** | Restaurants, dining | Minutes | `time`, `duration`, `personsNumber`, `floorPlanId` |
| **Room** | Hotels, accommodations | Nights | `checkIn`, `checkOut`, `nights`, `ratePerNight`, `guestId` |
| **Rental** | Equipment, vehicles, spaces | Hours/Minutes | `startAt`, `endAt`, `tierId`, `payment` |

Each type has its own SDK resource:
- `client.tableReservations`
- `client.roomReservations`
- `client.rentalReservations`

---

## Prerequisites

1. Active WIIL Platform account
2. API key with business management permissions
3. Node.js project with wiil-js SDK installed

---

## Table Reservations

Table reservations require a floor plan with sections and tables.

### Create a Floor Plan

```typescript
import { WiilClient } from 'wiil-js';
import { CanvasUnit, TableShape } from 'wiil-core-js';

const client = new WiilClient({ apiKey: process.env.WIIL_API_KEY! });

const floorPlan = await client.floorPlans.createDefinition({
  name: 'Main Dining Room',
  description: 'Primary dining area with 10 tables',
  capacity: 40,
  canvasDimensions: { width: 800, height: 600, unit: CanvasUnit.PX },
  isActive: true,
  sections: [
    {
      name: 'Window Section',
      capacity: 16,
      color: '#4A90D9',
      isActive: true,
      sortOrder: 1,
      tables: [
        {
          number: 'W1',
          x: 100,
          y: 100,
          width: 80,
          height: 80,
          shape: TableShape.ROUND,
          minParty: 2,
          maxParty: 4,
          combinableWith: [],
        },
        {
          number: 'W2',
          x: 250,
          y: 100,
          width: 120,
          height: 80,
          shape: TableShape.RECT,
          minParty: 4,
          maxParty: 6,
          combinableWith: [],
        },
        {
          number: 'W3',
          x: 400,
          y: 100,
          width: 100,
          height: 100,
          shape: TableShape.ROUND,
          minParty: 4,
          maxParty: 6,
          combinableWith: [],
        },
      ],
    },
    {
      name: 'Main Floor',
      capacity: 24,
      color: '#7B68EE',
      isActive: true,
      sortOrder: 2,
      tables: [
        {
          number: 'M1',
          x: 100,
          y: 300,
          width: 150,
          height: 80,
          shape: TableShape.RECT,
          minParty: 6,
          maxParty: 8,
          combinableWith: [],
        },
      ],
    },
  ],
});

console.log(`Floor Plan Created: ${floorPlan.id}`);
```

### Query Available Table Slots

```typescript
import { ResourceType, ReservationCandidateSlot } from 'wiil-core-js';

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const localDate = tomorrow.toISOString().split('T')[0];

const slotResponse = await client.tableReservations.getAvailableSlots({
  resourceType: ResourceType.TABLE,
  localDate: localDate,
  partySize: 4,
  floorPlanId: floorPlan.id,
  maxResults: 10,
});

console.log(`Found ${slotResponse.slots.length} available slots`);
slotResponse.slots.forEach((slot: ReservationCandidateSlot, idx) => {
  console.log(`  ${idx + 1}. ${slot.startTimeOfDay} (available: ${slot.isAvailable})`);
});
```

### Create Table Reservation

```typescript
import { CreateTableReservationSchema } from 'wiil-core-js';

const slot = slotResponse.slots.find(s => s.isAvailable);
if (!slot) throw new Error('No available slots');

// Use slot time directly - API expects UTC seconds
const reservation = await client.tableReservations.create({
  resourceId: floorPlan.id,
  customerId: 'cust_123',
  floorPlanId: floorPlan.id,
  time: slot.startTimeUtcSec,
  duration: 120,
  personsNumber: 4,
  isVip: false,
  notes: 'Anniversary dinner - window table preferred',
});

console.log(`Reservation Created: ${reservation.id}`);
console.log(`Time: ${new Date(reservation.time * 1000).toLocaleString()}`);
console.log(`Party Size: ${reservation.personsNumber}`);
```

### Get Table Reservation

```typescript
const reservation = await client.tableReservations.get('reservation_123');

console.log(`Reservation: ${reservation.id}`);
console.log(`Customer: ${reservation.customerId}`);
console.log(`Time: ${new Date(reservation.time * 1000).toLocaleString()}`);
console.log(`Status: ${reservation.status}`);
```

### List Table Reservations

```typescript
const result = await client.tableReservations.list();

console.log(`Total Reservations: ${result.data.length}`);
result.data.forEach(res => {
  console.log(`- ${res.id}: ${new Date(res.time * 1000).toLocaleDateString()} for ${res.personsNumber} people`);
});
```

### Update Table Reservation

```typescript
import { UpdateTableReservationSchema } from 'wiil-core-js';

const updated = await client.tableReservations.update(reservation.id, {
  id: reservation.id,
  personsNumber: 6,
  notes: 'Updated: Party size increased to 6',
});

console.log(`Updated party size: ${updated.personsNumber}`);
```

### Cancel Table Reservation

```typescript
const cancelled = await client.tableReservations.cancel(
  reservation.id,
  'Customer requested cancellation'
);

console.log(`Status: ${cancelled.status}`);
```

### Delete Table Reservation

```typescript
await client.tableReservations.delete('reservation_123');
console.log('Reservation deleted');
```

---

## Room Reservations

Room reservations are for hotels and accommodations, with check-in/check-out dates and nightly rates.

### Create Room Resource

```typescript
import { ResourceType, ResourceInstanceStatus } from 'wiil-core-js';

const roomResource = await client.reservationResources.create({
  name: 'Deluxe Ocean Suite',
  resourceType: ResourceType.ROOM,
  capacity: 4,
  isAvailable: true,
  amenities: ['WiFi', 'Air Conditioning', 'Mini Bar', 'Ocean View'],
  checklistTemplate: [],
  applicableTierIds: [],
  instances: [
    { name: 'Room 101', code: 'R101', status: ResourceInstanceStatus.AVAILABLE, isAvailable: true },
    { name: 'Room 102', code: 'R102', status: ResourceInstanceStatus.AVAILABLE, isAvailable: true },
  ],
});

console.log(`Room Resource Created: ${roomResource.id}`);
```

### Create Room Reservation

```typescript
import { 
  CreateRoomReservationSchema, 
  ReservationStatus, 
  PaymentStatus 
} from 'wiil-core-js';

// API expects UTC seconds
const nowSec = Math.floor(Date.now() / 1000);
const checkIn = nowSec + (24 * 60 * 60); // Tomorrow
const checkOut = checkIn + (3 * 24 * 60 * 60); // 3 nights later

const roomReservation = await client.roomReservations.create({
  resourceId: roomResource.id,
  guestId: 'cust_456',
  personsNumber: 2,
  checkIn: checkIn,
  checkOut: checkOut,
  nights: 3,
  status: ReservationStatus.PENDING,
  ratePerNight: [
    { date: new Date(checkIn * 1000).toISOString().split('T')[0], amount: 299.00 },
    { date: new Date((checkIn + 24*60*60) * 1000).toISOString().split('T')[0], amount: 299.00 },
    { date: new Date((checkIn + 48*60*60) * 1000).toISOString().split('T')[0], amount: 299.00 },
  ],
  totalWithTax: 980.67,
  deposit: 299.00,
  paymentStatus: PaymentStatus.PENDING,
  notes: 'Late check-in requested around 10 PM',
});

console.log(`Room Reservation Created: ${roomReservation.id}`);
console.log(`Check-in: ${new Date(roomReservation.checkIn * 1000).toLocaleDateString()}`);
console.log(`Check-out: ${new Date(roomReservation.checkOut * 1000).toLocaleDateString()}`);
console.log(`Total: $${roomReservation.totalWithTax}`);
```

### Get Room Reservation

```typescript
const roomRes = await client.roomReservations.get('reservation_123');

console.log(`Guest: ${roomRes.guestId}`);
console.log(`Nights: ${roomRes.nights}`);
console.log(`Total: $${roomRes.totalWithTax}`);
console.log(`Deposit: $${roomRes.deposit}`);
```

### Get Room Reservations by Guest

```typescript
const guestReservations = await client.roomReservations.getByGuest('cust_456');

console.log(`Guest has ${guestReservations.data.length} reservations`);
guestReservations.data.forEach(res => {
  console.log(`- ${new Date(res.checkIn * 1000).toLocaleDateString()} to ${new Date(res.checkOut * 1000).toLocaleDateString()}`);
});
```

### Get Room Reservations by Resource

```typescript
const resourceReservations = await client.roomReservations.getByResource(roomResource.id);

console.log(`Room has ${resourceReservations.data.length} reservations`);
```

### List Room Reservations

```typescript
const result = await client.roomReservations.list();

console.log(`Total Room Reservations: ${result.data.length}`);
```

### Update Room Reservation

```typescript
import { UpdateRoomReservationSchema } from 'wiil-core-js';

const updated = await client.roomReservations.update(roomReservation.id, {
  id: roomReservation.id,
  personsNumber: 3,
  notes: 'Extra bed requested for third guest',
  deposit: 350.00,
});

console.log(`Updated deposit: $${updated.deposit}`);
```

### Cancel Room Reservation

```typescript
import { ReservationStatus } from 'wiil-core-js';

const cancelled = await client.roomReservations.cancel(
  roomReservation.id,
  'Change of travel plans'
);

console.log(`Status: ${cancelled.status}`);
```

### Delete Room Reservation

```typescript
await client.roomReservations.delete('reservation_123');
console.log('Room reservation deleted');
```

---

## Rental Reservations

Rental reservations are for equipment, vehicles, or spaces with hourly/daily rates.

### Create Rental Resource

```typescript
import { ResourceType, ResourceInstanceStatus } from 'wiil-core-js';

const rentalResource = await client.reservationResources.create({
  name: 'Mountain Bike - Premium',
  resourceType: ResourceType.RENTAL,
  capacity: 1,
  isAvailable: true,
  amenities: ['Helmet included', 'Lock included'],
  checklistTemplate: [],
  applicableTierIds: [],
  instances: [
    { name: 'Bike #001', code: 'MTB-001', status: ResourceInstanceStatus.AVAILABLE, isAvailable: true },
    { name: 'Bike #002', code: 'MTB-002', status: ResourceInstanceStatus.AVAILABLE, isAvailable: true },
  ],
});

console.log(`Rental Resource Created: ${rentalResource.id}`);
```

### Query Available Rental Slots

```typescript
import { ResourceType, RentalCandidateSlot } from 'wiil-core-js';

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const localDate = tomorrow.toISOString().split('T')[0];

const slotResponse = await client.rentalReservations.getAvailableSlots({
  resourceType: ResourceType.RENTAL,
  localDate: localDate,
  resourceId: rentalResource.id,
  durationMinutes: 240, // 4 hours
  maxResults: 10,
});

console.log(`Found ${slotResponse.slots.length} available slots`);
slotResponse.slots.forEach((slot: RentalCandidateSlot, idx) => {
  console.log(`  ${idx + 1}. Pickup: ${slot.pickupTimeOfDay}, Return: ${slot.returnTimeOfDay}`);
});
```

### Create Rental Reservation

```typescript
import { 
  CreateRentalReservationSchema, 
  RentalReservationStatus, 
  DepositStatus 
} from 'wiil-core-js';

const slot = slotResponse.slots.find(s => s.isAvailable);
if (!slot) throw new Error('No available rental slots');

// Use slot times directly - API expects UTC seconds
const rentalReservation = await client.rentalReservations.create({
  resourceId: rentalResource.id,
  customerId: 'cust_789',
  startAt: slot.startTimeUtcSec,
  endAt: slot.endTimeUtcSec,
  tierId: 'tier_standard',
  status: RentalReservationStatus.UPCOMING,
  payment: {
    rentalCharge: 75.00,
    securityDeposit: 200.00,
    depositStatus: DepositStatus.PENDING,
  },
  checklistCompletions: [],
  notes: 'First-time renter, provide extra instructions',
});

console.log(`Rental Reservation Created: ${rentalReservation.id}`);
console.log(`Pickup: ${new Date(rentalReservation.startAt * 1000).toLocaleString()}`);
console.log(`Return: ${new Date(rentalReservation.endAt * 1000).toLocaleString()}`);
console.log(`Rental Charge: $${rentalReservation.payment.rentalCharge}`);
```

### Get Rental Reservation

```typescript
const rental = await client.rentalReservations.get('reservation_123');

console.log(`Customer: ${rental.customerId}`);
console.log(`Pickup: ${new Date(rental.startAt * 1000).toLocaleString()}`);
console.log(`Rental Charge: $${rental.payment.rentalCharge}`);
console.log(`Security Deposit: $${rental.payment.securityDeposit}`);
```

### Get Rental Reservations by Customer

```typescript
const customerRentals = await client.rentalReservations.getByCustomer('cust_789');

console.log(`Customer has ${customerRentals.data.length} rental reservations`);
```

### Get Rental Reservations by Resource

```typescript
const resourceRentals = await client.rentalReservations.getByResource(rentalResource.id);

console.log(`Resource has ${resourceRentals.data.length} reservations`);
```

### List Rental Reservations

```typescript
const result = await client.rentalReservations.list();

console.log(`Total Rental Reservations: ${result.data.length}`);
```

### Update Rental Reservation

```typescript
import { UpdateRentalReservationSchema, DepositStatus } from 'wiil-core-js';

const updated = await client.rentalReservations.update(rentalReservation.id, {
  id: rentalReservation.id,
  notes: 'Customer requested early pickup',
  payment: {
    rentalCharge: 85.00,
    securityDeposit: 200.00,
    depositStatus: DepositStatus.PAID,
  },
});

console.log(`Updated rental charge: $${updated.payment.rentalCharge}`);
console.log(`Deposit status: ${updated.payment.depositStatus}`);
```

### Cancel Rental Reservation

```typescript
import { RentalReservationStatus } from 'wiil-core-js';

const cancelled = await client.rentalReservations.cancel(
  rentalReservation.id,
  'Weather conditions not suitable'
);

console.log(`Status: ${cancelled.status}`);
```

### Delete Rental Reservation

```typescript
await client.rentalReservations.delete('reservation_123');
console.log('Rental reservation deleted');
```

---

## Resource Management

### Resource Categories

Organize resources into categories:

```typescript
import { ResourceType } from 'wiil-core-js';

// Create category
const category = await client.resourceCategories.create({
  name: 'Conference Rooms',
  description: 'Meeting and conference spaces',
  resourceType: ResourceType.ROOM,
  isActive: true,
  displayOrder: 1,
});

// Get category
const cat = await client.resourceCategories.get(category.id);

// Get categories by type
const roomCategories = await client.resourceCategories.getByResourceType(ResourceType.ROOM);

// Get active categories
const activeCategories = await client.resourceCategories.getActive();

// List all categories
const allCategories = await client.resourceCategories.list();

// Update category
const updated = await client.resourceCategories.update(category.id, {
  id: category.id,
  description: 'Premium meeting spaces',
  displayOrder: 2,
});

// Batch create categories
const batchResult = await client.resourceCategories.createBatch([
  { name: 'Executive Suites', resourceType: ResourceType.ROOM, isActive: true, displayOrder: 10 },
  { name: 'Equipment Rentals', resourceType: ResourceType.RENTAL, isActive: true, displayOrder: 11 },
]);

// Delete category
await client.resourceCategories.delete(category.id);
```

### Resource Instances

Manage individual bookable units within a resource:

```typescript
import { ResourceInstanceStatus } from 'wiil-core-js';

// Create instance
const instance = await client.resourceInstances.create({
  resourceId: roomResource.id,
  name: 'Room 201',
  code: 'R201',
  status: ResourceInstanceStatus.AVAILABLE,
  isAvailable: true,
  attributes: [
    { key: 'floor', value: '2' },
    { key: 'view', value: 'garden' },
  ],
});

// Get instance
const inst = await client.resourceInstances.get(instance.id);

// Get instances by resource
const resourceInstances = await client.resourceInstances.getByResource(roomResource.id);

// Get instances by status
const availableInstances = await client.resourceInstances.getByStatus(ResourceInstanceStatus.AVAILABLE);

// List all instances
const allInstances = await client.resourceInstances.list();

// Update instance
const updatedInst = await client.resourceInstances.update(instance.id, {
  id: instance.id,
  code: 'R201-PREMIUM',
  attributes: [
    { key: 'floor', value: '2' },
    { key: 'view', value: 'ocean' },
    { key: 'upgrade', value: 'premium' },
  ],
});

// Delete instance
await client.resourceInstances.delete(instance.id);
```

---

## Reservation Settings

Configure per-location reservation settings:

```typescript
// Create settings
const settings = await client.reservationSettings.create({
  locationId: 'loc_123',
  supportTableReservations: true,
  supportRoomReservations: true,
  supportRentalReservations: false,
  table: {
    defaultDurationMinutes: 90,
    turnoverMinutes: 15,
    slotIntervalMinutes: 30,
    advanceBookingDays: 30,
    maxPartySize: 12,
  },
});

// Get settings
const s = await client.reservationSettings.get(settings.id);

// Get settings by location
const locationSettings = await client.reservationSettings.getByLocation('loc_123');

// List all settings
const allSettings = await client.reservationSettings.list();

// Update settings
const updated = await client.reservationSettings.update({
  id: settings.id,
  table: {
    advanceBookingDays: 60,
    maxPartySize: 20,
  },
});

// Delete settings
await client.reservationSettings.delete(settings.id);
```

---

## Status Enums

### Room Reservation Status

```typescript
import { ReservationStatus } from 'wiil-core-js';

// ReservationStatus.PENDING     - Awaiting confirmation
// ReservationStatus.CONFIRMED   - Confirmed
// ReservationStatus.CHECKED_IN  - Guest has arrived
// ReservationStatus.CHECKED_OUT - Guest has departed
// ReservationStatus.CANCELLED   - Reservation cancelled
// ReservationStatus.NO_SHOW     - Guest did not arrive
```

### Rental Reservation Status

```typescript
import { RentalReservationStatus } from 'wiil-core-js';

// RentalReservationStatus.UPCOMING   - Scheduled for future
// RentalReservationStatus.ACTIVE     - Currently in use
// RentalReservationStatus.COMPLETED  - Returned
// RentalReservationStatus.CANCELLED  - Cancelled
```

### Resource Instance Status

```typescript
import { ResourceInstanceStatus } from 'wiil-core-js';

// ResourceInstanceStatus.AVAILABLE   - Ready for booking
// ResourceInstanceStatus.OCCUPIED    - Currently in use
// ResourceInstanceStatus.MAINTENANCE - Under maintenance
// ResourceInstanceStatus.RESERVED    - Reserved but not started
```

---

## Complete Example: Restaurant Reservation System

```typescript
import { WiilClient } from 'wiil-js';
import { 
  CanvasUnit, 
  TableShape, 
  ResourceType,
  PreferredContactMethod,
} from 'wiil-core-js';

async function setupRestaurantReservations() {
  const client = new WiilClient({ apiKey: process.env.WIIL_API_KEY! });

  // 1. Create a customer
  console.log('Creating customer...');
  const customer = await client.customers.create({
    phone_number: '+15551234567',
    firstname: 'John',
    lastname: 'Smith',
    preferred_language: 'en',
    preferred_contact_method: PreferredContactMethod.SMS,
    isValidatedNames: false,
  });
  console.log(`Customer: ${customer.id}`);

  // 2. Create floor plan with tables
  console.log('\nCreating floor plan...');
  const floorPlan = await client.floorPlans.createDefinition({
    name: 'Main Dining',
    description: 'Primary dining area',
    capacity: 24,
    canvasDimensions: { width: 800, height: 600, unit: CanvasUnit.PX },
    isActive: true,
    sections: [
      {
        name: 'Window Section',
        capacity: 12,
        color: '#4A90D9',
        isActive: true,
        sortOrder: 1,
        tables: [
          { number: 'W1', x: 100, y: 100, width: 80, height: 80, shape: TableShape.ROUND, minParty: 2, maxParty: 4, combinableWith: [] },
          { number: 'W2', x: 200, y: 100, width: 100, height: 80, shape: TableShape.RECT, minParty: 4, maxParty: 6, combinableWith: [] },
        ],
      },
      {
        name: 'Main Floor',
        capacity: 12,
        color: '#7B68EE',
        isActive: true,
        sortOrder: 2,
        tables: [
          { number: 'M1', x: 100, y: 300, width: 120, height: 80, shape: TableShape.RECT, minParty: 4, maxParty: 6, combinableWith: [] },
          { number: 'M2', x: 250, y: 300, width: 100, height: 100, shape: TableShape.ROUND, minParty: 4, maxParty: 6, combinableWith: [] },
        ],
      },
    ],
  });
  console.log(`Floor Plan: ${floorPlan.id}`);

  // 3. Query available slots for tomorrow evening
  console.log('\nQuerying available slots...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const localDate = tomorrow.toISOString().split('T')[0];

  const slotResponse = await client.tableReservations.getAvailableSlots({
    resourceType: ResourceType.TABLE,
    localDate: localDate,
    partySize: 4,
    floorPlanId: floorPlan.id,
    maxResults: 10,
  });

  if (slotResponse.slots.length === 0) {
    console.log('No available slots');
    return;
  }

  console.log(`Found ${slotResponse.slots.length} slots`);
  slotResponse.slots.forEach((slot, idx) => {
    console.log(`  ${idx + 1}. ${slot.startTimeOfDay}`);
  });

  // 4. Create reservation using first available slot
  console.log('\nCreating reservation...');
  const slot = slotResponse.slots.find(s => s.isAvailable) || slotResponse.slots[0];

  const reservation = await client.tableReservations.create({
    resourceId: floorPlan.id,
    customerId: customer.id,
    floorPlanId: floorPlan.id,
    time: slot.startTimeUtcSec, // API expects UTC seconds
    duration: 120,
    personsNumber: 4,
    isVip: true,
    notes: 'Anniversary dinner - please prepare special dessert',
  });
  console.log(`Reservation: ${reservation.id}`);
  console.log(`Time: ${new Date(reservation.time).toLocaleString()}`);

  // 5. List all reservations
  console.log('\nAll reservations:');
  const allReservations = await client.tableReservations.list();
  allReservations.data.forEach(res => {
    console.log(`- ${res.id}: ${new Date(res.time * 1000).toLocaleDateString()} for ${res.personsNumber}`);
  });

  return { customer, floorPlan, reservation };
}

setupRestaurantReservations().catch(console.error);
```

---

## Best Practices

### 1. Always Query Available Slots

```typescript
// Table reservations
const tableSlots = await client.tableReservations.getAvailableSlots({
  resourceType: ResourceType.TABLE,
  localDate: '2026-06-22',
  partySize: 4,
  floorPlanId: floorPlan.id,
  maxResults: 10,
});

// Rental reservations
const rentalSlots = await client.rentalReservations.getAvailableSlots({
  resourceType: ResourceType.RENTAL,
  localDate: '2026-06-22',
  resourceId: resource.id,
  durationMinutes: 240,
  maxResults: 10,
});
```

### 2. Use Correct Field Names Per Type

```typescript
// Table: time, duration, personsNumber, floorPlanId, customerId
// Room: checkIn, checkOut, nights, guestId, ratePerNight
// Rental: startAt, endAt, tierId, customerId, payment
```

### 3. Handle Deposits Appropriately

```typescript
// Room deposit
const roomRes = await client.roomReservations.create({
  // ...
  deposit: 299.00,
  paymentStatus: PaymentStatus.PENDING,
});

// Rental security deposit
const rentalRes = await client.rentalReservations.create({
  // ...
  payment: {
    rentalCharge: 75.00,
    securityDeposit: 200.00,
    depositStatus: DepositStatus.PENDING,
  },
});
```

---

## Troubleshooting

### No available slots returned

**Problem**: `getAvailableSlots` returns empty array

**Solution**: Verify floor plan/resource exists and is active:
```typescript
const floorPlan = await client.floorPlans.get('fp_123');
console.log(`Active: ${floorPlan.isActive}`);
console.log(`Sections: ${floorPlan.sections?.length}`);
```

### Resource type mismatch

**Problem**: Creating reservation fails with type error

**Solution**: Use correct client for each type:
```typescript
// Tables
await client.tableReservations.create({ ... });

// Rooms
await client.roomReservations.create({ ... });

// Rentals
await client.rentalReservations.create({ ... });
```

### Missing required fields

**Problem**: Validation error on create

**Solution**: Include all required fields per type:
```typescript
// Table requires: resourceId, customerId, floorPlanId, time, duration, personsNumber
// Room requires: resourceId, guestId, checkIn, checkOut, nights, ratePerNight, totalWithTax
// Rental requires: resourceId, customerId, startAt, endAt, tierId, payment
```

---

[Back to Examples](../README.md)
