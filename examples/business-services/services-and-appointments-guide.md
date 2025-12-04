# Business Services & Appointments Guide

**Manage services and schedule appointments for your service-based business**

**Setup Time**: ~10 minutes

---

## Overview

Business Services and Appointments enable you to manage service offerings and customer bookings on the WIIL Platform. This system is ideal for service-based businesses like salons, spas, medical clinics, consulting firms, and any business offering time-based services.

**Key Capabilities**:
- Define business services with pricing and duration
- Schedule customer appointments
- Manage appointment lifecycle (confirm, cancel, reschedule)
- Track appointment status and history
- Generate QR codes for easy booking

---

## Prerequisites

1. ✅ Active WIIL Platform account
2. ✅ API key with business management permissions
3. ✅ Node.js project with wiil-js SDK installed

---

## Quick Start

### Step 1: Create a Business Service

```typescript
import { WiilClient } from 'wiil-js';

const client = new WiilClient({ apiKey: process.env.WIIL_API_KEY! });

const service = await client.businessServices.create({
  name: 'Professional Haircut',
  description: 'Premium haircut service with styling',
  duration: 45,
  bufferTime: 15,
  price: 50.00,
  isBookable: true,
  isActive: true
});

console.log(`Service Created: ${service.name}`);
console.log(`Service ID: ${service.id}`);
console.log(`Price: $${service.price}`);
console.log(`Duration: ${service.duration} minutes`);
```

### Step 2: Book an Appointment

```typescript
import { AppointmentStatus } from 'wiil-js';

const startTime = Date.now() + 24 * 60 * 60 * 1000; // Tomorrow
const duration = 45; // minutes

const appointment = await client.serviceAppointments.create({
  businessServiceId: service.id,
  customerId: 'cust_123',
  startTime: startTime,
  endTime: startTime + (duration * 60 * 1000),
  duration: duration,
  totalPrice: 50.00,
  depositPaid: 0
});

console.log(`Appointment Created: ${appointment.id}`);
console.log(`Customer: ${appointment.customerId}`);
console.log(`Scheduled: ${new Date(appointment.startTime).toLocaleString()}`);
```

### Step 3: Confirm the Appointment

```typescript
const confirmed = await client.serviceAppointments.updateStatus(
  appointment.id,
  { status: AppointmentStatus.CONFIRMED }
);

console.log(`Appointment Status: ${confirmed.status}`);
```

---

## Business Services

### Service Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ Yes | Service name |
| `description` | string | ✅ Yes | Service description |
| `duration` | number | ❌ No | Service duration in minutes (default applies) |
| `bufferTime` | number | ❌ No | Buffer time after service in minutes (default applies) |
| `price` | number | ❌ No | Service price (optional, defaults to 0) |
| `isBookable` | boolean | ❌ No | Can be booked online (default: true) |
| `isActive` | boolean | ❌ No | Service is active (default: true) |

### Create a Service

```typescript
const service = await client.businessServices.create({
  name: 'Massage Therapy',
  description: '60-minute therapeutic massage',
  duration: 60,
  bufferTime: 10,
  price: 80.00,
  isBookable: true,
  isActive: true,
  displayOrder: 2
});
```

### Get a Service

```typescript
const service = await client.businessServices.get('service_123');

console.log(`Name: ${service.name}`);
console.log(`Duration: ${service.duration} minutes`);
console.log(`Price: $${service.price}`);
```

### Update a Service

```typescript
const updated = await client.businessServices.update({
  id: 'service_123',
  name: 'Premium Massage Therapy',
  price: 90.00
});
```

### List All Services

```typescript
const services = await client.businessServices.list({
  page: 1,
  pageSize: 20
});

console.log(`Total Services: ${services.meta.totalCount}`);
services.data.forEach(service => {
  console.log(`- ${service.name}: $${service.price} (${service.duration} min)`);
});
```

### Delete a Service

```typescript
const deleted = await client.businessServices.delete('service_123');
if (deleted) {
  console.log('Service deleted successfully');
}
```

---

## Service Appointments

### Appointment Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `businessServiceId` | string | ✅ Yes | Service being booked |
| `customerId` | string | ✅ Yes | Customer ID |
| `startTime` | number | ✅ Yes | Start time (Unix timestamp) |
| `endTime` | number | ❌ No | End time (Unix timestamp) |
| `duration` | number | ❌ No | Duration in minutes (default applies) |
| `totalPrice` | number | ❌ No | Total price (default: 0) |
| `depositPaid` | number | ❌ No | Deposit amount paid (default: 0) |
| `assignedUserAccountId` | string | ❌ No | Assigned staff member |
| `calendarId` | string | ❌ No | Calendar ID for sync |
| `calendarEventId` | string | ❌ No | External calendar event ID |
| `calendarProvider` | string | ❌ No | Calendar provider (google, outlook, calendly) |

### Create an Appointment

```typescript
const appointment = await client.serviceAppointments.create({
  businessServiceId: 'service_123',
  customerId: 'cust_456',
  startTime: Date.now() + 3600000, // 1 hour from now
  endTime: Date.now() + 7200000,   // 2 hours from now
  duration: 60,
  totalPrice: 80.00,
  depositPaid: 20.00
});
```

### Get an Appointment

```typescript
const appointment = await client.serviceAppointments.get('appointment_123');

console.log(`Customer ID: ${appointment.customerId}`);
console.log(`Service ID: ${appointment.businessServiceId}`);
console.log(`Time: ${new Date(appointment.startTime).toLocaleString()}`);
console.log(`Status: ${appointment.status}`);
```

### List Customer Appointments

```typescript
const appointments = await client.serviceAppointments.getByCustomer('cust_123', {
  page: 1,
  pageSize: 20
});

console.log(`Customer has ${appointments.meta.totalCount} appointments`);
appointments.data.forEach(apt => {
  console.log(`- ${new Date(apt.startTime).toLocaleDateString()}: ${apt.status}`);
});
```

### List Service Appointments

```typescript
const appointments = await client.serviceAppointments.getByService('service_123', {
  page: 1,
  pageSize: 20
});

console.log(`Service has ${appointments.meta.totalCount} bookings`);
```

### List All Appointments

```typescript
const appointments = await client.serviceAppointments.list({
  page: 1,
  pageSize: 50
});

console.log(`Total Appointments: ${appointments.meta.totalCount}`);
```

---

## Appointment Lifecycle

### Appointment Statuses

```typescript
enum AppointmentStatus {
  PENDING = 'pending',           // Awaiting confirmation
  CONFIRMED = 'confirmed',       // Confirmed by business
  COMPLETED = 'completed',       // Service completed
  CANCELLED = 'cancelled',       // Cancelled by customer or business
  NO_SHOW = 'no_show'           // Customer didn't show up
}
```

### Update Appointment Status

```typescript
import { AppointmentStatus } from 'wiil-js';

// Confirm appointment
const confirmed = await client.serviceAppointments.updateStatus(
  'appointment_123',
  { status: AppointmentStatus.CONFIRMED }
);

// Mark as completed
const completed = await client.serviceAppointments.updateStatus(
  'appointment_123',
  { status: AppointmentStatus.COMPLETED }
);

// Mark as no-show
const noShow = await client.serviceAppointments.updateStatus(
  'appointment_123',
  { status: AppointmentStatus.NO_SHOW }
);
```

### Cancel an Appointment

```typescript
// Cancel with reason
const cancelled = await client.serviceAppointments.cancel(
  'appointment_123',
  { reason: 'Customer requested cancellation' }
);

console.log(`Status: ${cancelled.status}`);
console.log(`Reason: ${cancelled.cancelReason}`);

// Cancel without reason
const cancelled2 = await client.serviceAppointments.cancel(
  'appointment_456',
  {}
);
```

### Reschedule an Appointment

```typescript
const newStartTime = Date.now() + 48 * 60 * 60 * 1000; // 2 days from now
const newEndTime = newStartTime + 60 * 60 * 1000;      // +1 hour

const rescheduled = await client.serviceAppointments.reschedule(
  'appointment_123',
  {
    startTime: newStartTime.toString(),
    endTime: newEndTime.toString()
  }
);

console.log(`Rescheduled to: ${new Date(rescheduled.startTime).toLocaleString()}`);
```

### Reschedule with Different Service

```typescript
const rescheduled = await client.serviceAppointments.reschedule(
  'appointment_123',
  {
    startTime: newStartTime.toString(),
    endTime: newEndTime.toString(),
    serviceId: 'service_456' // Change to different service
  }
);

console.log(`New Service: ${rescheduled.businessServiceId}`);
```

### Delete an Appointment

```typescript
const deleted = await client.serviceAppointments.delete('appointment_123');
if (deleted) {
  console.log('Appointment deleted successfully');
}
```

---

## Complete Example: Salon Booking System

```typescript
import { WiilClient, AppointmentStatus } from 'wiil-js';

async function setupSalonBooking() {
  const client = new WiilClient({ apiKey: process.env.WIIL_API_KEY! });

  // 1. Create services
  console.log('Creating salon services...');

  const haircut = await client.businessServices.create({
    name: 'Haircut & Style',
    description: 'Professional haircut with styling',
    duration: 45,
    bufferTime: 15,
    price: 50.00,
    isBookable: true,
    isActive: true
  });

  const coloring = await client.businessServices.create({
    name: 'Hair Coloring',
    description: 'Full hair coloring service',
    duration: 120,
    bufferTime: 20,
    price: 150.00,
    isBookable: true,
    isActive: true
  });

  const massage = await client.businessServices.create({
    name: 'Scalp Massage',
    description: 'Relaxing scalp massage',
    duration: 30,
    bufferTime: 10,
    price: 35.00,
    isBookable: true,
    isActive: true
  });

  console.log(`Created ${3} services`);

  // 2. Book appointments
  console.log('\nBooking appointments...');

  const appointment1 = await client.serviceAppointments.create({
    businessServiceId: haircut.id,
    customerId: 'cust_001',
    startTime: Date.now() + 24 * 60 * 60 * 1000, // Tomorrow
    duration: 45,
    totalPrice: 50.00,
    depositPaid: 0
  });

  const appointment2 = await client.serviceAppointments.create({
    businessServiceId: coloring.id,
    customerId: 'cust_002',
    startTime: Date.now() + 48 * 60 * 60 * 1000, // In 2 days
    duration: 120,
    totalPrice: 150.00,
    depositPaid: 50.00, // Deposit required
    assignedUserAccountId: 'stylist_001'
  });

  console.log(`Created ${2} appointments`);

  // 3. Confirm first appointment
  const confirmed = await client.serviceAppointments.updateStatus(
    appointment1.id,
    { status: AppointmentStatus.CONFIRMED }
  );

  console.log(`\nAppointment ${confirmed.id} confirmed`);

  // 4. List all upcoming appointments
  const upcoming = await client.serviceAppointments.list({
    page: 1,
    pageSize: 50
  });

  console.log(`\nUpcoming Appointments (${upcoming.meta.totalCount}):`);
  upcoming.data.forEach(apt => {
    const date = new Date(apt.startTime).toLocaleString();
    console.log(`- Customer ${apt.customerId}: ${date} (${apt.status})`);
  });

  // 5. Get customer appointment history
  const customerApts = await client.serviceAppointments.getByCustomer('cust_001');
  console.log(`\nCustomer has ${customerApts.meta.totalCount} appointment(s)`);

  // 6. Get service bookings
  const serviceBookings = await client.serviceAppointments.getByService(haircut.id);
  console.log(`\nHaircut service has ${serviceBookings.meta.totalCount} booking(s)`);

  return {
    services: [haircut, coloring, massage],
    appointments: [appointment1, appointment2]
  };
}

setupSalonBooking().catch(console.error);
```

---

## Calendar Integration

### Appointment with Calendar Sync

```typescript
import { CalendarProvider } from 'wiil-js';

const appointment = await client.serviceAppointments.create({
  businessServiceId: 'service_123',
  customerId: 'cust_456',
  customerName: 'Jane Doe',
  customerEmail: 'jane@example.com',
  startTime: Date.now() + 3600000,
  duration: 60,
  totalPrice: 80.00,
  depositPaid: 0,
  status: AppointmentStatus.CONFIRMED,
  calendarId: 'google-calendar-123',
  calendarEventId: 'event-456',
  calendarProvider: CalendarProvider.GOOGLE
});

console.log(`Synced to ${appointment.calendarProvider} calendar`);
```

---

## Best Practices

### 1. Service Configuration

```typescript
// ✅ Good: Clear service definitions
const service = await client.businessServices.create({
  name: 'Deep Tissue Massage',
  description: '90-minute deep tissue therapeutic massage',
  duration: 90,
  bufferTime: 15,  // Time for cleanup/prep
  price: 120.00,
  isBookable: true,
  isActive: true
});

// ❌ Avoid: Vague or incomplete definitions
const badService = await client.businessServices.create({
  name: 'Massage',
  duration: 60,
  price: 0  // Free services should still have price: 0
});
```

### 2. Appointment Scheduling

```typescript
// ✅ Good: Validate time slots
const serviceDuration = 60; // minutes
const bufferTime = 15;
const totalDuration = serviceDuration + bufferTime;

const startTime = Date.now() + 24 * 60 * 60 * 1000;
const endTime = startTime + (totalDuration * 60 * 1000);

// ❌ Avoid: Overlapping appointments without buffer
```

### 3. Status Management

```typescript
// ✅ Good: Follow status progression
// pending → confirmed → completed

const apt = await client.serviceAppointments.create({
  businessServiceId: 'service_123',
  customerId: 'cust_456',
  startTime: Date.now() + 3600000,
  duration: 60,
  totalPrice: 50.00
});

// Status defaults to 'pending', now confirm it
const confirmed = await client.serviceAppointments.updateStatus(
  apt.id,
  { status: AppointmentStatus.CONFIRMED }
);

// After service is done
const completed = await client.serviceAppointments.updateStatus(
  apt.id,
  { status: AppointmentStatus.COMPLETED }
);
```

### 4. Error Handling

```typescript
try {
  const appointment = await client.serviceAppointments.create({
    businessServiceId: 'service_123',
    customerId: 'cust_456',
    startTime: Date.now(),
    duration: 60,
    totalPrice: 50.00
  });
} catch (error) {
  if (error.status === 404) {
    console.error('Service not found');
  } else if (error.status === 409) {
    console.error('Time slot conflict');
  } else {
    console.error('Failed to create appointment:', error.message);
  }
}
```

---

## Troubleshooting

### Service not bookable
**Problem**: Customers can't book a service

**Solution**:
```typescript
// Ensure service is active and bookable
const service = await client.businessServices.update({
  id: 'service_123',
  isActive: true,
  isBookable: true
});
```

### Missing customer ID

**Problem**: Appointment creation fails

**Solution**: Always include required customerId
```typescript
// ✅ Include required customer ID
const appointment = await client.serviceAppointments.create({
  businessServiceId: 'service_123',
  customerId: 'cust_456',  // ← Required field
  startTime: Date.now() + 3600000,
  duration: 60,
  totalPrice: 50.00
});
```

---

## Next Steps

- **AI-Powered Booking**: Integrate with WIIL AI agents for conversational booking
- **Calendar Sync**: Connect with Google Calendar or Outlook
- **Notifications**: Set up appointment reminders
- **Payment Integration**: Add deposit and payment processing

---

[← Back to Examples](../README.md)
