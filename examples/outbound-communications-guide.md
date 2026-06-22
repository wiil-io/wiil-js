# Outbound Communications Guide

Enterprise-grade notifications without the infrastructure burden

---

## The Problem You're Not Solving Anymore

Building a production notification system typically means:

- **Weeks of provider integration** — SMTP configuration, SMS gateway contracts, telephony stack setup
- **Template management sprawl** — Hardcoded strings, no version control, developer bottlenecks for copy changes
- **Reliability engineering** — Retry logic, queue management, rate limiting, failure handling
- **Multi-channel fragmentation** — Different APIs, different patterns, different monitoring for each channel
- **Compliance overhead** — Audit trails, unsubscribe handling, delivery confirmation, GDPR considerations

The WIIL Outbound Communications system eliminates this entire layer. Your application sends a single API call. The platform handles everything else.

---

## What You Get

### Unified Multi-Channel Delivery

One SDK, one pattern, three channels. Learn it once:

```typescript
// Email
await client.outboundEmails.create({ to: [...], templateId, templateVariables });

// SMS
await client.outboundSms.create({ to, templateId, templateVariables });

// Voice Call
await client.outboundCalls.create({ to, agentConfigurationId });
```

Same structure. Same error handling. Same status tracking. Your code stays clean regardless of channel.

### Centralized Template Management

Templates live in the platform, not your codebase:

- **Marketing updates copy** — No developer involvement, no code deploy
- **Brand consistency enforced** — One source of truth across all channels
- **Variable validation** — Required fields caught at send time, not in production
- **Preview before sending** — Render templates with test data to verify output

```typescript
// Create once
await client.outboundTemplates.createEmailTemplate({
  name: 'Order Shipped',
  code: 'order_shipped',
  subjectTemplate: 'Your order #{{orderNumber}} is on the way',
  bodyHtmlTemplate: '<h1>{{customerName}}, your order shipped!</h1>...',
  variables: [
    { key: 'customerName', required: true },
    { key: 'orderNumber', required: true },
  ],
});

// Use everywhere
await client.outboundEmails.create({
  to: [{ email: customer.email }],
  templateId: 'order_shipped',
  templateVariables: { customerName: 'Jane', orderNumber: 'ORD-5521' },
});
```

### Production Infrastructure — Already Built

What the platform handles so you don't have to:

| Concern        | Platform Responsibility                                |
| -------------- | ------------------------------------------------------ |
| **Delivery**   | Provider failover, retry with exponential backoff      |
| **Queuing**    | High-volume batching, rate limiting, priority handling |
| **Scheduling** | Future sends, timezone-aware delivery windows          |
| **Tracking**   | Delivery status, bounce handling, engagement metrics   |
| **Compliance** | Audit logs, unsubscribe management, data retention     |
| **Monitoring** | Delivery dashboards, failure alerts, channel health    |

You call `.create()`. The platform ensures it arrives.

---

## Use Cases

### Transactional Notifications

High-reliability, time-sensitive messages triggered by user actions:

```typescript
// Order confirmation — immediate
await client.outboundEmails.create({
  to: [{ email: order.customerEmail }],
  templateId: 'order_confirmation',
  templateVariables: {
    orderNumber: order.id,
    total: order.total,
    items: order.items.map(i => i.name).join(', '),
  },
});

// Shipping update — with tracking
await client.outboundSms.create({
  to: order.customerPhone,
  from: businessPhone,
  templateId: 'shipping_update',
  templateVariables: {
    trackingUrl: shipment.trackingUrl,
  },
});
```

### Appointment & Booking Reminders

Reduce no-shows with automated multi-channel reminders:

```typescript
// 24-hour reminder via SMS
await client.outboundSms.create({
  to: appointment.customerPhone,
  from: businessPhone,
  templateId: 'appointment_reminder_24h',
  templateVariables: {
    serviceName: appointment.serviceName,
    dateTime: formatDateTime(appointment.startsAt),
    location: appointment.location,
  },
});

// Same-day confirmation call
await client.outboundCalls.create({
  to: appointment.customerPhone,
  from: businessPhone,
  agentConfigurationId: 'appointment_confirmation_agent',
  scheduleType: 'scheduled',
  scheduledAt: appointment.startsAt - (2 * 60 * 60 * 1000), // 2 hours before
});
```

### Verification & Security

Two-factor authentication without third-party dependencies:

```typescript
const code = generateVerificationCode();

await client.outboundSms.create({
  to: user.phone,
  from: businessPhone,
  templateId: 'verification_code',
  templateVariables: { code },
});

// Template: "Your verification code is {{code}}. Valid for 10 minutes."
```

### Reservation Confirmations

Multi-channel confirmation for bookings:

```typescript
// Email with full details
await client.outboundEmails.create({
  to: [{ email: guest.email, name: guest.name }],
  templateId: 'reservation_confirmed',
  templateVariables: {
    guestName: guest.name,
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    roomType: reservation.roomType,
    confirmationCode: reservation.code,
  },
});

// SMS with essential info
await client.outboundSms.create({
  to: guest.phone,
  from: businessPhone,
  templateId: 'reservation_confirmed_sms',
  templateVariables: {
    confirmationCode: reservation.code,
    checkIn: reservation.checkIn,
  },
});
```

### Proactive Customer Outreach

AI-powered outbound calls for follow-ups, surveys, and re-engagement:

```typescript
// Post-service follow-up call
await client.outboundCalls.create({
  to: customer.phone,
  from: businessPhone,
  agentConfigurationId: 'satisfaction_survey_agent',
  scheduleType: 'scheduled',
  scheduledAt: serviceCompletedAt + (24 * 60 * 60), // Next day (seconds)
  maxDuration: 300, // 5 minutes
  maxRetries: 2,
});
```

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────────┐
│                        YOUR APPLICATION                             │
│                                                                     │
│   client.outboundEmails.create()  ←  Single API call               │
│   client.outboundSms.create()                                       │
│   client.outboundCalls.create()                                     │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     WIIL PLATFORM LAYER                             │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │  Template   │  │   Queue     │  │   Retry     │  │  Status    │ │
│  │  Rendering  │  │  Management │  │   Logic     │  │  Tracking  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │   Rate      │  │  Provider   │  │  Delivery   │  │   Audit    │ │
│  │  Limiting   │  │  Failover   │  │ Optimization│  │   Logs     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    PROVIDER INTEGRATIONS                            │
│                                                                     │
│      ┌───────────┐      ┌───────────┐      ┌───────────┐           │
│      │   Email   │      │    SMS    │      │ Telephony │           │
│      │ Providers │      │ Gateways  │      │  Stack    │           │
│      └───────────┘      └───────────┘      └───────────┘           │
│                                                                     │
│      SendGrid, SES,     Twilio, Vonage,    SIP, PSTN,              │
│      Mailgun, etc.      MessageBird        WebRTC                   │
└─────────────────────────────────────────────────────────────────────┘
```

**You own the top layer.** The platform owns everything else.

---

## Implementation Reference

### Setup

```typescript
import { WiilClient } from 'wiil-js';
import { 
  OutboundTemplateChannel,
  CallRequestStatus,
  EmailStatus,
  SmsStatus 
} from 'wiil-core-js';

const client = new WiilClient({ apiKey: process.env.WIIL_API_KEY! });
```

---

### Templates

Templates are the foundation. Create them once, use them across your entire application.

#### Email Template Creation

```typescript
const template = await client.outboundTemplates.createEmailTemplate({
  name: 'Welcome Email',
  code: 'welcome',
  channel: OutboundTemplateChannel.EMAIL,
  subjectTemplate: 'Welcome to {{companyName}}, {{firstName}}!',
  bodyHtmlTemplate: `
    <h1>Welcome, {{firstName}}!</h1>
    <p>Thank you for joining {{companyName}}.</p>
  `,
  bodyTextTemplate: 'Welcome, {{firstName}}! Thank you for joining {{companyName}}.',
  variables: [
    { key: 'firstName', required: true },
    { key: 'companyName', required: true },
  ],
});
```

#### SMS Template Creation

```typescript
const template = await client.outboundTemplates.createSmsTemplate({
  name: 'Verification Code',
  code: 'verify',
  channel: 'SMS',
  bodyTemplate: 'Your {{companyName}} code is {{code}}. Valid for 10 minutes.',
  variables: [
    { key: 'code', required: true },
    { key: 'companyName', required: true },
  ],
});
```

#### Template Operations

```typescript
// Get by ID
const template = await client.outboundTemplates.get('template_123');

// Get by code (useful for deployment-independent references)
const template = await client.outboundTemplates.getByCode('welcome');

// Get all templates for a channel
const emailTemplates = await client.outboundTemplates.getByChannel(
  OutboundTemplateChannel.EMAIL
);

// List all templates
const all = await client.outboundTemplates.list();

// Update email template
await client.outboundTemplates.updateEmailTemplate({
  id: template.id,
  subjectTemplate: 'Updated: Welcome to {{companyName}}!',
});

// Update SMS template
await client.outboundTemplates.updateSmsTemplate({
  id: template.id,
  bodyTemplate: 'Your code: {{code}}. Expires in 5 min.',
});

// Activate/deactivate (inactive templates cannot be used)
await client.outboundTemplates.activate(template.id);
await client.outboundTemplates.deactivate(template.id);

// Preview with test data
const preview = await client.outboundTemplates.render(template.id, {
  firstName: 'Test',
  companyName: 'Acme Corp',
});
console.log(preview.subject, preview.bodyHtml);

// Delete
await client.outboundTemplates.delete(template.id);
```

---

### Emails

#### Send with Template

```typescript
const result = await client.outboundEmails.create({
  to: [{ email: 'customer@example.com', name: 'Jane Doe' }],
  templateId: 'order_confirmation',
  templateVariables: {
    customerName: 'Jane',
    orderNumber: 'ORD-12345',
    total: '149.99',
  },
});
```

#### Send with Direct Content

```typescript
const result = await client.outboundEmails.create({
  to: [{ email: 'customer@example.com', name: 'Jane Doe' }],
  subject: 'Your receipt',
  bodyHtml: '<h1>Thank you for your purchase!</h1>',
  bodyText: 'Thank you for your purchase!',
  replyTo: 'support@example.com',
});
```

#### Multiple Recipients

```typescript
const result = await client.outboundEmails.create({
  to: [
    { email: 'alice@example.com', name: 'Alice' },
    { email: 'bob@example.com', name: 'Bob' },
  ],
  cc: [{ email: 'manager@example.com' }],
  bcc: [{ email: 'archive@example.com' }],
  templateId: 'team_update',
  templateVariables: { ... },
});
```

#### Email Operations

```typescript
// Get by ID
const email = await client.outboundEmails.get('email_123');

// Query by status
const queued = await client.outboundEmails.getByStatus(EmailStatus.QUEUED);
const sent = await client.outboundEmails.getByStatus(EmailStatus.SENT);

// Query by template
const fromTemplate = await client.outboundEmails.getByTemplate('template_123');

// Query by date range (UTC seconds)
const nowSec = Math.floor(Date.now() / 1000);
const recent = await client.outboundEmails.getByDateRange(
  nowSec - (7 * 24 * 60 * 60), // 7 days ago
  nowSec
);

// List all
const all = await client.outboundEmails.list();

// Update (before sending)
await client.outboundEmails.update({ id: email.id, subject: 'Updated subject' });

// Cancel (if still queued)
await client.outboundEmails.cancel(email.id, 'Content needs revision');

// Delete
await client.outboundEmails.delete(email.id);
```

---

### SMS

#### Send with Template

```typescript
const result = await client.outboundSms.create({
  to: '+14155551234',
  from: '+14155555678',
  templateId: 'verification_code',
  templateVariables: { code: '847291' },
});
```

#### Send with Direct Content

```typescript
const result = await client.outboundSms.create({
  to: '+14155551234',
  from: '+14155555678',
  body: 'Your appointment is confirmed for tomorrow at 2 PM.',
  maxRetries: 2,
});
```

#### SMS Operations

```typescript
// Get by ID
const sms = await client.outboundSms.get('sms_123');

// Query by status
const queued = await client.outboundSms.getByStatus(SmsStatus.QUEUED);

// Query by recipient
const toNumber = await client.outboundSms.getByRecipient('+14155551234');

// Query by template
const fromTemplate = await client.outboundSms.getByTemplate('template_123');

// Query by date range
const recent = await client.outboundSms.getByDateRange(startDate, endDate);

// List all
const all = await client.outboundSms.list();

// Update (before sending)
await client.outboundSms.update({ id: sms.id, body: 'Updated message' });

// Cancel (if still queued)
await client.outboundSms.cancel(sms.id, 'Wrong recipient');

// Delete
await client.outboundSms.delete(sms.id);
```

---

### Calls

#### Immediate Call

```typescript
const result = await client.outboundCalls.create({
  to: '+14155551234',
  from: '+14155555678',
  agentConfigurationId: 'support_agent',
  scheduleType: 'immediate',
  maxDuration: 300, // 5 minutes
  maxRetries: 2,
});
```

#### Scheduled Call

```typescript
const result = await client.outboundCalls.create({
  to: '+14155551234',
  from: '+14155555678',
  agentConfigurationId: 'survey_agent',
  scheduleType: 'scheduled',
  scheduledAt: Math.floor(Date.now() / 1000) + (2 * 60 * 60), // 2 hours from now
  maxDuration: 600,
  maxRetries: 3,
});
```

#### Call Operations

```typescript
// Get by ID
const call = await client.outboundCalls.get('call_123');

// Query by agent
const agentCalls = await client.outboundCalls.getByAgent('agent_config_123');

// Query by status
const pending = await client.outboundCalls.getByStatus(CallRequestStatus.PENDING);
const completed = await client.outboundCalls.getByStatus(CallRequestStatus.COMPLETED);

// Query by date range
const recent = await client.outboundCalls.getByDateRange(startDate, endDate);

// List all
const all = await client.outboundCalls.list();

// Update (reschedule)
await client.outboundCalls.update({
  id: call.id,
  scheduledAt: newTime,
});

// Cancel
await client.outboundCalls.cancel(call.id, 'Customer requested cancellation');

// Delete
await client.outboundCalls.delete(call.id);
```

---

### Status Enums

```typescript
import { 
  OutboundTemplateChannel,
  CallRequestStatus,
  EmailStatus,
  SmsStatus 
} from 'wiil-core-js';

// Template channels
OutboundTemplateChannel.EMAIL
OutboundTemplateChannel.SMS

// Call statuses
CallRequestStatus.PENDING
CallRequestStatus.SCHEDULED
CallRequestStatus.IN_PROGRESS
CallRequestStatus.COMPLETED
CallRequestStatus.FAILED
CallRequestStatus.CANCELLED

// Email statuses
EmailStatus.QUEUED
EmailStatus.SENDING
EmailStatus.SENT
EmailStatus.DELIVERED
EmailStatus.FAILED
EmailStatus.BOUNCED
EmailStatus.CANCELLED

// SMS statuses
SmsStatus.QUEUED
SmsStatus.SENDING
SmsStatus.SENT
SmsStatus.DELIVERED
SmsStatus.FAILED
SmsStatus.CANCELLED
```

---

## Complete Example: Multi-Channel Notification System

```typescript
import { WiilClient } from 'wiil-js';
import { OutboundTemplateChannel } from 'wiil-core-js';

async function initializeNotificationSystem() {
  const client = new WiilClient({ apiKey: process.env.WIIL_API_KEY! });

  // 1. Create your template library
  const templates = {
    orderConfirmation: await client.outboundTemplates.createEmailTemplate({
      name: 'Order Confirmation',
      code: 'order_confirmation',
      channel: OutboundTemplateChannel.EMAIL,
      subjectTemplate: 'Order #{{orderNumber}} Confirmed',
      bodyHtmlTemplate: `
        <h1>Thank you, {{customerName}}!</h1>
        <p>Your order #{{orderNumber}} is confirmed.</p>
        <p><strong>Total:</strong> ${{total}}</p>
      `,
      bodyTextTemplate: 'Order #{{orderNumber}} confirmed. Total: ${{total}}',
      variables: [
        { key: 'customerName', required: true },
        { key: 'orderNumber', required: true },
        { key: 'total', required: true },
      ],
    }),

    shippingUpdate: await client.outboundTemplates.createSmsTemplate({
      name: 'Shipping Update',
      code: 'shipping_update',
      channel: 'SMS',
      bodyTemplate: 'Your order #{{orderNumber}} shipped! Track: {{trackingUrl}}',
      variables: [
        { key: 'orderNumber', required: true },
        { key: 'trackingUrl', required: true },
      ],
    }),

    verificationCode: await client.outboundTemplates.createSmsTemplate({
      name: 'Verification Code',
      code: 'verification',
      channel: 'SMS',
      bodyTemplate: 'Your code is {{code}}. Valid for 10 minutes.',
      variables: [{ key: 'code', required: true }],
    }),
  };

  // 2. Activate all templates
  await Promise.all(
    Object.values(templates).map(t => client.outboundTemplates.activate(t.id))
  );

  console.log('Notification system initialized');
  return templates;
}

// Usage in your application
async function onOrderPlaced(order: Order) {
  // Email confirmation
  await client.outboundEmails.create({
    to: [{ email: order.customer.email, name: order.customer.name }],
    templateId: 'order_confirmation',
    templateVariables: {
      customerName: order.customer.name,
      orderNumber: order.id,
      total: order.total.toFixed(2),
    },
  });
}

async function onOrderShipped(order: Order, shipment: Shipment) {
  // SMS notification
  await client.outboundSms.create({
    to: order.customer.phone,
    from: BUSINESS_PHONE,
    templateId: 'shipping_update',
    templateVariables: {
      orderNumber: order.id,
      trackingUrl: shipment.trackingUrl,
    },
  });
}

async function sendVerificationCode(phone: string, code: string) {
  await client.outboundSms.create({
    to: phone,
    from: BUSINESS_PHONE,
    templateId: 'verification',
    templateVariables: { code },
  });
}
```

---

## Best Practices

### Use Template Codes, Not IDs

Template IDs change between environments. Codes are stable:

```typescript
// Fragile — ID differs per environment
templateId: 'tmpl_abc123'

// Robust — code is consistent
const template = await client.outboundTemplates.getByCode('order_confirmation');
await client.outboundEmails.create({ templateId: template.id, ... });
```

### Validate Templates Before Go-Live

```typescript
const preview = await client.outboundTemplates.render('order_confirmation', {
  customerName: 'Test User',
  orderNumber: 'TEST-001',
  total: '99.99',
});

// Verify output before activating
console.log(preview.subject);
console.log(preview.bodyHtml);
```

### Handle Status Appropriately

```typescript
const result = await client.outboundEmails.create({ ... });

// The message is QUEUED, not SENT
// Use webhooks or polling for delivery confirmation
if (result.request?.status === 'QUEUED') {
  console.log(`Email queued: ${result.request.id}`);
}
```

### Phone Number Format

Always use E.164 format for phone numbers:

```typescript
// Correct
to: '+14155551234'

// Incorrect
to: '(415) 555-1234'
to: '415-555-1234'
```

---

## Troubleshooting

| Issue                            | Cause                               | Solution                                                 |
| -------------------------------- | ----------------------------------- | -------------------------------------------------------- |
| "Required variable not provided" | Missing template variable           | Include all required variables in `templateVariables`    |
| "Template not found"             | Template doesn't exist or inactive  | Verify template exists and call `activate()`             |
| "Invalid phone number"           | Wrong format                        | Use E.164 format: `+[country][number]`                   |
| Email not delivered              | Various                             | Check status via `getByStatus()`, verify recipient       |

---

[Back to Examples](./README.md)
