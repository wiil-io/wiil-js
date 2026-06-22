# Business Services & Appointments Guide

**Manage services and schedule appointments for your service-based business**

**Setup Time**: ~10 minutes

---

## Overview

Business Services and Appointments enable you to manage service offerings and customer bookings on the WIIL Platform. This system is ideal for service-based businesses like salons, spas, medical clinics, consulting firms, and any business offering time-based services.

**Key Capabilities**:
- Define business services with pricing and duration
- Organize services into categories
- Manage service providers (staff who perform services)
- Query available appointment slots
- Schedule customer appointments
- Manage appointment lifecycle (confirm, cancel, reschedule)
- Track appointment status and history

---

## Prerequisites

1. Active WIIL Platform account
2. API key with business management permissions
3. Node.js project with wiil-js SDK installed

---

## Quick Start

### Step 1: Create a Business Service

```typescript
import { WiilClient } from 'wiil-js';

const client = new WiilClient({ apiKey: process.env.WIIL_API_KEY! });

const service = await client.businessServices.create({
  organizationId: 'org_123',
  name: 'Professional Haircut',
  description: 'Premium haircut service with styling',
  duration: 45,
  bufferBefore: 0,
  bufferAfter: 15,
  basePrice: 50.00,
  isBookable: true,
  isActive: true,
  requiredResources: [],
  lateCancelFeePercent: 50,
  noShowFeePercent: 100,
});

console.log(`Service Created: ${service.name}`);
console.log(`Service ID: ${service.id}`);
console.log(`Price: $${service.basePrice}`);
console.log(`Duration: ${service.duration} minutes`);
```

### Step 2: Create a Service Provider

```typescript
const provider = await client.servicePersons.create({
  name: 'Jane Smith',
  description: 'Senior Hair Stylist',
  isActive: true,
  bookableOnline: true,
  bookableByStaff: true,
});

console.log(`Provider Created: ${provider.name}`);
```

### Step 3: Query Available Slots

```typescript
import { ServiceCandidateSlot } from 'wiil-core-js';

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const localDate = tomorrow.toISOString().split('T')[0];

const slotResponse = await client.serviceAppointments.getAvailableSlots({
  serviceId: service.id,
  localDate: localDate,
  providerId: provider.id,
  maxResults: 20,
});

console.log(`Found ${slotResponse.slots.length} available slots`);
slotResponse.slots.forEach((slot, idx) => {
  console.log(`  Slot ${idx + 1}: ${slot.startTimeOfDay}`);
});
```

### Step 4: Book an Appointment

```typescript
import { CreateServiceAppointmentSchema } from 'wiil-core-js';

const slot = slotResponse.slots[0];
// API expects UTC seconds - use slot times directly
const duration = Math.round((slot.endTimeUtcSec - slot.startTimeUtcSec) / 60);

const appointment = await client.serviceAppointments.create({
  businessServiceId: service.id,
  customerId: 'cust_123',
  startTime: slot.startTimeUtcSec,
  endTime: slot.endTimeUtcSec,
  duration: duration,
  totalPrice: 50.00,
  depositPaid: 0,
});

console.log(`Appointment Created: ${appointment.id}`);
console.log(`Customer: ${appointment.customerId}`);
console.log(`Scheduled: ${new Date(appointment.startTime * 1000).toLocaleString()}`);
```

### Step 5: Confirm the Appointment

```typescript
import { AppointmentStatus } from 'wiil-core-js';

const confirmed = await client.serviceAppointments.updateStatus(
  appointment.id,
  AppointmentStatus.CONFIRMED
);

console.log(`Appointment Status: ${confirmed.status}`);
```

---

## Business Services

### Create a Service

```typescript
const service = await client.businessServices.create({
  organizationId: 'org_123',
  name: 'Massage Therapy',
  description: '60-minute therapeutic massage',
  duration: 60,
  bufferBefore: 10,
  bufferAfter: 5,
  basePrice: 80.00,
  isBookable: true,
  isActive: true,
  requiredResources: [],
  lateCancelFeePercent: 50,
  noShowFeePercent: 100,
});
```

### Get a Service

```typescript
const service = await client.businessServices.get('service_123');

console.log(`Name: ${service.name}`);
console.log(`Duration: ${service.duration} minutes`);
console.log(`Price: $${service.basePrice}`);
```

### Update a Service

```typescript
const updated = await client.businessServices.update({
  id: 'service_123',
  name: 'Premium Massage Therapy',
  basePrice: 90.00,
});

console.log(`Updated: ${updated.name} - $${updated.basePrice}`);
```

### List All Services

```typescript
const result = await client.businessServices.list({
  page: 1,
  pageSize: 20,
});

console.log(`Total Services: ${result.meta.totalCount}`);
result.data.forEach(service => {
  console.log(`- ${service.name}: $${service.basePrice} (${service.duration} min)`);
});
```

### Delete a Service

```typescript
await client.businessServices.delete('service_123');
console.log('Service deleted successfully');
```

### Batch Create Services

```typescript
const result = await client.businessServices.createBatch([
  {
    organizationId: 'org_123',
    name: 'Quick Consultation',
    description: '30-minute consultation',
    duration: 30,
    bufferBefore: 5,
    bufferAfter: 5,
    basePrice: 49.99,
    isBookable: true,
    isActive: true,
    requiredResources: [],
    lateCancelFeePercent: 50,
    noShowFeePercent: 100,
  },
  {
    organizationId: 'org_123',
    name: 'Standard Session',
    description: '60-minute session',
    duration: 60,
    bufferBefore: 10,
    bufferAfter: 5,
    basePrice: 89.99,
    isBookable: true,
    isActive: true,
    requiredResources: [],
    lateCancelFeePercent: 50,
    noShowFeePercent: 100,
  },
  {
    organizationId: 'org_123',
    name: 'Extended Session',
    description: '90-minute session',
    duration: 90,
    bufferBefore: 15,
    bufferAfter: 10,
    basePrice: 129.99,
    isBookable: true,
    isActive: true,
    requiredResources: [],
    lateCancelFeePercent: 50,
    noShowFeePercent: 100,
  },
]);

console.log(`Created ${result.data.length} services`);
result.data.forEach(svc => {
  console.log(`- ${svc.name}: $${svc.basePrice} (${svc.duration} min)`);
});
```

---

## Service Categories

Organize your services into categories for better management and customer navigation.

### Create a Category

```typescript
const category = await client.serviceCategories.create({
  organizationId: 'org_123',
  name: 'Hair Services',
  description: 'All hair-related services',
  displayOrder: 1,
  isActive: true,
});

console.log(`Category Created: ${category.name}`);
```

### Get a Category

```typescript
const category = await client.serviceCategories.get('category_123');

console.log(`Name: ${category.name}`);
console.log(`Display Order: ${category.displayOrder}`);
```

### Update a Category

```typescript
const updated = await client.serviceCategories.update({
  id: 'category_123',
  name: 'Premium Hair Services',
  displayOrder: 2,
});

console.log(`Updated: ${updated.name}`);
```

### List All Categories

```typescript
const result = await client.serviceCategories.list();

console.log(`Total Categories: ${result.data.length}`);
result.data.forEach(cat => {
  console.log(`- ${cat.name} (order: ${cat.displayOrder})`);
});
```

### Delete a Category

```typescript
await client.serviceCategories.delete('category_123');
console.log('Category deleted successfully');
```

### Batch Create Categories

```typescript
const result = await client.serviceCategories.createBatch([
  {
    organizationId: 'org_123',
    name: 'Spa Treatments',
    description: 'Relaxing spa services',
    displayOrder: 10,
    isActive: true,
  },
  {
    organizationId: 'org_123',
    name: 'Consultations',
    description: 'Professional consultations',
    displayOrder: 11,
    isActive: true,
  },
]);

console.log(`Created ${result.data.length} categories`);
```

---

## Service Persons

Service persons are staff members who can perform services and be assigned to appointments.

### Create a Service Person

```typescript
const person = await client.servicePersons.create({
  name: 'Jane Smith',
  description: 'Senior hair stylist with 10 years experience',
  locationId: 'loc_123',
  commissionPercent: 35,
  bookableOnline: true,
  bookableByStaff: true,
  isActive: true,
});

console.log(`Person Created: ${person.name}`);
```

### Get a Service Person

```typescript
const person = await client.servicePersons.get('person_123');

console.log(`Name: ${person.name}`);
console.log(`Bookable Online: ${person.bookableOnline}`);
```

### Get Persons by Location

```typescript
const result = await client.servicePersons.getByLocation('loc_123');

console.log(`Staff at location: ${result.data.length}`);
result.data.forEach(person => {
  console.log(`- ${person.name}`);
});
```

### Update a Service Person

```typescript
const updated = await client.servicePersons.update({
  id: 'person_123',
  commissionPercent: 45,
  bookableOnline: false,
});

console.log(`Updated commission: ${updated.commissionPercent}%`);
```

### List All Service Persons

```typescript
const result = await client.servicePersons.list();

console.log(`Total Staff: ${result.data.length}`);
result.data.forEach(person => {
  console.log(`- ${person.name} (${person.isActive ? 'active' : 'inactive'})`);
});
```

### Delete a Service Person

```typescript
await client.servicePersons.delete('person_123');
console.log('Service person deleted successfully');
```

### Batch Create Service Persons

```typescript
const result = await client.servicePersons.createBatch([
  {
    name: 'John Doe',
    description: 'Massage therapist',
    locationId: 'loc_123',
    commissionPercent: 30,
    bookableOnline: true,
    bookableByStaff: true,
    isActive: true,
  },
  {
    name: 'Mary Jane',
    description: 'Esthetician',
    locationId: 'loc_123',
    commissionPercent: 35,
    bookableOnline: true,
    bookableByStaff: true,
    isActive: true,
  },
]);

console.log(`Created ${result.data.length} service persons`);
```

---

## Service Providers

Service providers link services to service persons, allowing you to define which staff can perform which services, with optional price and duration overrides.

### Create a Service Provider

```typescript
const serviceProvider = await client.serviceProviders.create({
  serviceId: 'service_123',
  providerId: 'person_123',
  priceOverride: 75.00,
  durationOverride: 45,
  active: true,
});

console.log(`Linked service ${serviceProvider.serviceId} to provider ${serviceProvider.providerId}`);
```

### Get a Service Provider

```typescript
const serviceProvider = await client.serviceProviders.get('sp_123');

console.log(`Service ID: ${serviceProvider.serviceId}`);
console.log(`Provider ID: ${serviceProvider.providerId}`);
console.log(`Price Override: $${serviceProvider.priceOverride}`);
```

### Get Providers by Service

```typescript
const result = await client.serviceProviders.getByService('service_123');

console.log(`Providers for this service: ${result.data.length}`);
result.data.forEach(sp => {
  console.log(`- Provider ${sp.providerId} (${sp.active ? 'active' : 'inactive'})`);
});
```

### Get Services by Provider

```typescript
const result = await client.serviceProviders.getByProvider('person_123');

console.log(`Services offered by provider: ${result.data.length}`);
result.data.forEach(sp => {
  console.log(`- Service ${sp.serviceId}`);
});
```

### Update a Service Provider

```typescript
const updated = await client.serviceProviders.update({
  id: 'sp_123',
  priceOverride: 90.00,
  active: false,
});

console.log(`Updated price: $${updated.priceOverride}`);
```

### List All Service Providers

```typescript
const result = await client.serviceProviders.list();

console.log(`Total Service-Provider Links: ${result.data.length}`);
```

### Delete a Service Provider

```typescript
await client.serviceProviders.delete('sp_123');
console.log('Service provider link deleted successfully');
```

### Batch Create Service Providers

```typescript
const result = await client.serviceProviders.createBatch([
  {
    serviceId: 'service_haircut',
    providerId: 'person_123',
    active: true,
  },
  {
    serviceId: 'service_coloring',
    providerId: 'person_123',
    active: true,
  },
]);

console.log(`Created ${result.data.length} service provider links`);
```

---

## Service Appointments

### Query Available Slots

Before creating an appointment, query available time slots:

```typescript
import { ServiceCandidateSlot } from 'wiil-core-js';

const slotResponse = await client.serviceAppointments.getAvailableSlots({
  serviceId: 'service_123',
  localDate: '2026-06-22',
  providerId: 'person_123',
  maxResults: 20,
});

console.log(`Available slots: ${slotResponse.slots.length}`);
slotResponse.slots.forEach((slot, idx) => {
  console.log(`  ${idx + 1}. ${slot.startTimeOfDay} - startUtc: ${slot.startTimeUtcSec}`);
});
```

### Create an Appointment

```typescript
import { CreateServiceAppointmentSchema } from 'wiil-core-js';

const slot = slotResponse.slots[0];
// API expects UTC seconds
const duration = Math.round((slot.endTimeUtcSec - slot.startTimeUtcSec) / 60);

const appointment = await client.serviceAppointments.create({
  businessServiceId: 'service_123',
  customerId: 'cust_456',
  startTime: slot.startTimeUtcSec,
  endTime: slot.endTimeUtcSec,
  duration: duration,
  totalPrice: 80.00,
  depositPaid: 20.00,
});

console.log(`Appointment ID: ${appointment.id}`);
```

### Get an Appointment

```typescript
const appointment = await client.serviceAppointments.get('appointment_123');

console.log(`Customer ID: ${appointment.customerId}`);
console.log(`Service ID: ${appointment.businessServiceId}`);
console.log(`Time: ${new Date(appointment.startTime * 1000).toLocaleString()}`);
console.log(`Status: ${appointment.status}`);
```

### List All Appointments

```typescript
const result = await client.serviceAppointments.list();

console.log(`Total Appointments: ${result.data.length}`);
result.data.forEach(apt => {
  console.log(`- ${apt.id}: ${new Date(apt.startTime * 1000).toLocaleDateString()} (${apt.status})`);
});
```

### Get Appointments by Customer

```typescript
const result = await client.serviceAppointments.getByCustomer('cust_123', {
  page: 1,
  pageSize: 20,
});

console.log(`Customer has ${result.data.length} appointments`);
result.data.forEach(apt => {
  console.log(`- ${new Date(apt.startTime * 1000).toLocaleDateString()}: ${apt.status}`);
});
```

### Get Appointments by Service

```typescript
const result = await client.serviceAppointments.getByService('service_123', {
  page: 1,
  pageSize: 20,
});

console.log(`Service has ${result.data.length} bookings`);
```

### Get Appointments by Provider

```typescript
const result = await client.serviceAppointments.getByProvider('person_123', {
  page: 1,
  pageSize: 20,
});

console.log(`Provider has ${result.data.length} appointments`);
```

### Get Appointments by Date Range

```typescript
// API expects UTC seconds
const startDate = Math.floor(Date.now() / 1000);
const endDate = startDate + (7 * 24 * 60 * 60); // Next 7 days

const result = await client.serviceAppointments.getByDateRange(startDate, endDate, {
  page: 1,
  pageSize: 50,
});

console.log(`${result.data.length} appointments in the next week`);
```

### Delete an Appointment

```typescript
await client.serviceAppointments.delete('appointment_123');
console.log('Appointment deleted successfully');
```

---

## Appointment Lifecycle

### Appointment Statuses

```typescript
import { AppointmentStatus } from 'wiil-core-js';

// Available statuses:
// AppointmentStatus.PENDING     - 'pending'     - Awaiting confirmation
// AppointmentStatus.CONFIRMED   - 'confirmed'   - Confirmed by business
// AppointmentStatus.COMPLETED   - 'completed'   - Service completed
// AppointmentStatus.CANCELLED   - 'cancelled'   - Cancelled
// AppointmentStatus.NO_SHOW     - 'no_show'     - Customer didn't show up
```

### Update Appointment Status

```typescript
import { AppointmentStatus } from 'wiil-core-js';

// Confirm appointment
const confirmed = await client.serviceAppointments.updateStatus(
  'appointment_123',
  AppointmentStatus.CONFIRMED
);
console.log(`Status: ${confirmed.status}`);

// Mark as completed
const completed = await client.serviceAppointments.updateStatus(
  'appointment_123',
  AppointmentStatus.COMPLETED
);

// Mark as no-show
const noShow = await client.serviceAppointments.updateStatus(
  'appointment_123',
  AppointmentStatus.NO_SHOW
);
```

### Cancel an Appointment

```typescript
const cancelled = await client.serviceAppointments.cancel(
  'appointment_123',
  { cancelReason: 'Customer requested cancellation' }
);

console.log(`Status: ${cancelled.status}`);
console.log(`Reason: ${cancelled.cancelReason}`);
```

### Reschedule an Appointment

```typescript
// API expects UTC seconds
const newStartTime = Math.floor(Date.now() / 1000) + (48 * 60 * 60); // 2 days from now
const newEndTime = newStartTime + (60 * 60);                          // +1 hour

const rescheduled = await client.serviceAppointments.reschedule(
  'appointment_123',
  {
    startTime: newStartTime,
    endTime: newEndTime,
  }
);

console.log(`Rescheduled to: ${new Date(rescheduled.startTime * 1000).toLocaleString()}`);
```

### Reschedule with Different Service

```typescript
const rescheduled = await client.serviceAppointments.reschedule(
  'appointment_123',
  {
    startTime: newStartTime,
    endTime: newEndTime,
    businessServiceId: 'service_456',
  }
);

console.log(`New Service: ${rescheduled.businessServiceId}`);
```

---

## Complete Example: Salon Booking System

```typescript
import { WiilClient } from 'wiil-js';
import { AppointmentStatus, PreferredContactMethod } from 'wiil-core-js';

async function setupSalonBooking() {
  const client = new WiilClient({ apiKey: process.env.WIIL_API_KEY! });

  // 1. Create a customer
  console.log('Creating customer...');
  const customer = await client.customers.create({
    phone_number: '+15551234567',
    firstname: 'Jane',
    lastname: 'Doe',
    preferred_language: 'en',
    preferred_contact_method: PreferredContactMethod.EMAIL,
    isValidatedNames: false,
  });
  console.log(`Customer Created: ${customer.id}`);

  // 2. Create service category
  console.log('\nCreating service category...');
  const category = await client.serviceCategories.create({
    organizationId: 'org_salon',
    name: 'Hair Services',
    description: 'All hair-related services',
    displayOrder: 1,
    isActive: true,
  });
  console.log(`Category Created: ${category.name}`);

  // 3. Create services
  console.log('\nCreating services...');
  const haircut = await client.businessServices.create({
    organizationId: 'org_salon',
    name: 'Haircut & Style',
    description: 'Professional haircut with styling',
    duration: 60,
    bufferBefore: 0,
    bufferAfter: 0,
    basePrice: 50.00,
    isBookable: true,
    isActive: true,
    requiredResources: [],
    lateCancelFeePercent: 50,
    noShowFeePercent: 100,
  });
  console.log(`Service Created: ${haircut.name}`);

  // 4. Create service provider (stylist)
  console.log('\nCreating service provider...');
  const stylist = await client.servicePersons.create({
    name: 'Sarah Johnson',
    description: 'Senior stylist',
    isActive: true,
    bookableOnline: true,
    bookableByStaff: true,
  });
  console.log(`Stylist Created: ${stylist.name}`);

  // 5. Link service to provider
  console.log('\nLinking service to provider...');
  await client.serviceProviders.create({
    serviceId: haircut.id,
    providerId: stylist.id,
    active: true,
  });
  console.log('Service linked to provider');

  // 6. Query available slots
  console.log('\nQuerying available slots...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const localDate = tomorrow.toISOString().split('T')[0];

  const slotResponse = await client.serviceAppointments.getAvailableSlots({
    serviceId: haircut.id,
    localDate: localDate,
    providerId: stylist.id,
    maxResults: 10,
  });

  if (slotResponse.slots.length === 0) {
    console.log('No available slots found');
    return;
  }

  console.log(`Found ${slotResponse.slots.length} slots`);
  slotResponse.slots.forEach((slot, idx) => {
    console.log(`  ${idx + 1}. ${slot.startTimeOfDay}`);
  });

  // 7. Book an appointment using first available slot
  console.log('\nBooking appointment...');
  const slot = slotResponse.slots[0];
  // API expects UTC seconds
  const duration = Math.round((slot.endTimeUtcSec - slot.startTimeUtcSec) / 60);

  const appointment = await client.serviceAppointments.create({
    businessServiceId: haircut.id,
    customerId: customer.id,
    startTime: slot.startTimeUtcSec,
    endTime: slot.endTimeUtcSec,
    duration: duration,
    totalPrice: 50.00,
    depositPaid: 0,
  });
  console.log(`Appointment Created: ${appointment.id}`);

  // 8. Confirm the appointment
  console.log('\nConfirming appointment...');
  const confirmed = await client.serviceAppointments.updateStatus(
    appointment.id,
    AppointmentStatus.CONFIRMED
  );
  console.log(`Appointment Status: ${confirmed.status}`);

  // 9. List all appointments
  console.log('\nListing appointments...');
  const appointments = await client.serviceAppointments.list();
  console.log(`Total Appointments: ${appointments.data.length}`);
  appointments.data.forEach(apt => {
    const date = new Date(apt.startTime * 1000).toLocaleString();
    console.log(`- ${apt.id}: ${date} (${apt.status})`);
  });

  return {
    customer,
    category,
    service: haircut,
    stylist,
    appointment: confirmed,
  };
}

setupSalonBooking().catch(console.error);
```

---

## Best Practices

### 1. Always Query Available Slots

```typescript
// Always use getAvailableSlots before creating appointments
const slotResponse = await client.serviceAppointments.getAvailableSlots({
  serviceId: service.id,
  localDate: '2026-06-22',
  providerId: provider.id,
  maxResults: 20,
});

// Use slot times directly - API expects UTC seconds
const slot = slotResponse.slots[0];
const appointment = await client.serviceAppointments.create({
  businessServiceId: service.id,
  customerId: customer.id,
  startTime: slot.startTimeUtcSec,
  endTime: slot.endTimeUtcSec,
  duration: Math.round((slot.endTimeUtcSec - slot.startTimeUtcSec) / 60),
  totalPrice: service.basePrice,
  depositPaid: 0,
});
```

### 2. Service Configuration

```typescript
// Include all required fields with appropriate values
const service = await client.businessServices.create({
  organizationId: 'org_123',
  name: 'Deep Tissue Massage',
  description: '90-minute deep tissue therapeutic massage',
  duration: 90,
  bufferBefore: 15,
  bufferAfter: 10,
  basePrice: 120.00,
  isBookable: true,
  isActive: true,
  requiredResources: [],
  lateCancelFeePercent: 50,
  noShowFeePercent: 100,
});
```

### 3. Status Progression

```typescript
import { AppointmentStatus } from 'wiil-core-js';

// Follow the standard lifecycle: pending → confirmed → completed
const apt = await client.serviceAppointments.create({ ... });
// Status defaults to 'pending'

await client.serviceAppointments.updateStatus(apt.id, AppointmentStatus.CONFIRMED);

// After service is complete
await client.serviceAppointments.updateStatus(apt.id, AppointmentStatus.COMPLETED);
```

### 4. Error Handling

```typescript
try {
  const appointment = await client.serviceAppointments.create({
    businessServiceId: 'service_123',
    customerId: 'cust_456',
    startTime: slot.startTimeUtcSec, // API expects UTC seconds
    endTime: slot.endTimeUtcSec,
    duration: 60,
    totalPrice: 50.00,
    depositPaid: 0,
  });
} catch (error) {
  if (error.status === 404) {
    console.error('Service or customer not found');
  } else if (error.status === 409) {
    console.error('Time slot conflict - slot already booked');
  } else {
    console.error('Failed to create appointment:', error.message);
  }
}
```

---

## Troubleshooting

### No available slots returned

**Problem**: `getAvailableSlots` returns empty array

**Solution**: Verify the service and provider are active and linked:
```typescript
const service = await client.businessServices.get('service_123');
console.log(`Service active: ${service.isActive}, bookable: ${service.isBookable}`);

const providers = await client.serviceProviders.getByService('service_123');
console.log(`Linked providers: ${providers.data.length}`);
```

### Service not bookable

**Problem**: Customers can't book a service

**Solution**: Ensure service is active and bookable:
```typescript
await client.businessServices.update({
  id: 'service_123',
  isActive: true,
  isBookable: true,
});
```

### Missing customer ID

**Problem**: Appointment creation fails

**Solution**: Always include required customerId:
```typescript
const appointment = await client.serviceAppointments.create({
  businessServiceId: 'service_123',
  customerId: 'cust_456',  // Required
  startTime: slot.startTimeUtcSec,  // API expects UTC seconds
  endTime: slot.endTimeUtcSec,
  duration: 60,
  totalPrice: 50.00,
  depositPaid: 0,
});
```

---

## Next Steps

- **AI-Powered Booking**: Integrate with WIIL AI agents for conversational booking
- **Notifications**: Set up appointment reminders
- **Payment Integration**: Add deposit and payment processing

---

[Back to Examples](../README.md)
