# Messaging Guide

Quick-start guide for outbound messaging — calls, SMS, and email in minutes.

---

## Why This Exists

You need to notify customers. The traditional path:

- Configure SMTP servers or email providers
- Sign contracts with SMS gateways
- Integrate telephony stacks
- Build retry logic, queue management, delivery tracking
- Handle failures, bounces, compliance

**Skip all of that.** The WIIL Messaging APIs give you production-ready notifications with a single SDK call. No provider setup. No infrastructure. Just send.

---

## Quick Start

```typescript
import { WiilClient } from 'wiil-js';

const client = new WiilClient({ apiKey: process.env.WIIL_API_KEY! });

// Send an SMS
await client.outboundSms.create({
  to: '+12125551234',
  from: '+12125559999',
  body: 'Your appointment is confirmed for tomorrow at 3 PM.',
});

// Send an Email
await client.outboundEmails.create({
  to: [{ email: 'customer@example.com', name: 'John Smith' }],
  subject: 'Order Confirmed',
  bodyHtml: '<h1>Thank you!</h1><p>Your order is confirmed.</p>',
  bodyText: 'Thank you! Your order is confirmed.',
});

// Request a Call
await client.outboundCalls.create({
  to: '+12125551234',
  from: '+12125559999',
  agentConfigurationId: 'confirmation_agent',
  scheduleType: 'immediate',
});
```

Three channels. One pattern. Done.

---

## Send SMS

Direct message:

```typescript
await client.outboundSms.create({
  to: '+12125551234',
  from: '+12125559999',
  body: 'Your verification code is 847291. Valid for 10 minutes.',
  maxRetries: 2,
});
```

With template:

```typescript
await client.outboundSms.create({
  to: '+12125551234',
  from: '+12125559999',
  templateId: 'verification_code',
  templateVariables: { code: '847291' },
});
```

---

## Send Email

Direct content:

```typescript
await client.outboundEmails.create({
  to: [{ email: 'customer@example.com', name: 'John Smith' }],
  subject: 'Your Order Has Shipped',
  bodyHtml: '<h1>Good news!</h1><p>Your order is on its way.</p>',
  bodyText: 'Good news! Your order is on its way.',
  replyTo: 'support@example.com',
});
```

With template:

```typescript
await client.outboundEmails.create({
  to: [{ email: 'customer@example.com', name: 'John Smith' }],
  templateId: 'order_shipped',
  templateVariables: {
    customerName: 'John',
    orderNumber: 'ORD-12345',
    trackingUrl: 'https://track.example.com/12345',
  },
});
```

Multiple recipients:

```typescript
await client.outboundEmails.create({
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

---

## Request a Call

Immediate call:

```typescript
await client.outboundCalls.create({
  to: '+12125551234',
  from: '+12125559999',
  agentConfigurationId: 'support_agent',
  scheduleType: 'immediate',
  maxDuration: 300, // 5 minutes
  maxRetries: 2,
});
```

Scheduled call:

```typescript
await client.outboundCalls.create({
  to: '+12125551234',
  from: '+12125559999',
  agentConfigurationId: 'reminder_agent',
  scheduleType: 'scheduled',
  scheduledAt: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour from now (UTC seconds)
  maxDuration: 300,
  maxRetries: 3,
});
```

---

## Templates

Create once, use everywhere. Marketing updates copy without code deploys.

```typescript
import { OutboundTemplateChannel } from 'wiil-core-js';

// Create email template
const emailTemplate = await client.outboundTemplates.createEmailTemplate({
  name: 'Order Confirmation',
  code: 'order_confirmation',
  channel: OutboundTemplateChannel.EMAIL,
  subjectTemplate: 'Order #{{orderNumber}} Confirmed',
  bodyHtmlTemplate: '<h1>Thank you, {{customerName}}!</h1><p>Order confirmed.</p>',
  bodyTextTemplate: 'Thank you, {{customerName}}! Order confirmed.',
  variables: [
    { key: 'customerName', required: true },
    { key: 'orderNumber', required: true },
  ],
});

// Create SMS template
const smsTemplate = await client.outboundTemplates.createSmsTemplate({
  name: 'Verification Code',
  code: 'verification',
  channel: 'SMS',
  bodyTemplate: 'Your code is {{code}}. Valid for 10 minutes.',
  variables: [{ key: 'code', required: true }],
});

// Activate templates
await client.outboundTemplates.activate(emailTemplate.id);
await client.outboundTemplates.activate(smsTemplate.id);

// Preview before sending
const preview = await client.outboundTemplates.render(emailTemplate.id, {
  customerName: 'Test User',
  orderNumber: 'TEST-001',
});
console.log(preview.subject, preview.bodyHtml);
```

---

## Complete Example

Multi-channel appointment notifications:

```typescript
import { WiilClient } from 'wiil-js';

const client = new WiilClient({ apiKey: process.env.WIIL_API_KEY! });

async function sendAppointmentNotifications(appointment: {
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  dateTime: string;
  serviceName: string;
}) {
  const appointmentTime = new Date(appointment.dateTime).getTime();
  
  // 1. Immediate confirmation email
  await client.outboundEmails.create({
    to: [{ email: appointment.customerEmail, name: appointment.customerName }],
    templateId: 'appointment_confirmed',
    templateVariables: {
      customerName: appointment.customerName,
      serviceName: appointment.serviceName,
      dateTime: appointment.dateTime,
    },
  });
  console.log('Confirmation email sent');

  // 2. 24-hour reminder SMS
  await client.outboundSms.create({
    to: appointment.customerPhone,
    from: '+12125559999',
    templateId: 'appointment_reminder_24h',
    templateVariables: {
      serviceName: appointment.serviceName,
      dateTime: appointment.dateTime,
    },
  });
  console.log('Reminder SMS queued');

  // 3. 2-hour confirmation call
  await client.outboundCalls.create({
    to: appointment.customerPhone,
    from: '+12125559999',
    agentConfigurationId: 'appointment_confirmation_agent',
    scheduleType: 'scheduled',
    scheduledAt: appointmentTime - (2 * 60 * 60 * 1000),
    maxDuration: 180,
    maxRetries: 2,
  });
  console.log('Confirmation call scheduled');
}

sendAppointmentNotifications({
  customerEmail: 'jane@example.com',
  customerName: 'Jane Smith',
  customerPhone: '+12125551234',
  dateTime: '2026-06-25T15:00:00Z',
  serviceName: 'Haircut & Style',
}).catch(console.error);
```

---

## What the Platform Handles

| You Call                         | Platform Handles                                    |
| -------------------------------- | --------------------------------------------------- |
| `client.outboundSms.create()`    | Gateway selection, delivery, retry, status tracking |
| `client.outboundEmails.create()` | SMTP routing, bounce handling, deliverability       |
| `client.outboundCalls.create()`  | Telephony stack, AI agent, call recording           |

No provider contracts. No infrastructure setup. No reliability engineering.

---

## Phone Number Format

Always use E.164 format:

```typescript
// Correct
to: '+12125551234'

// Incorrect
to: '(212) 555-1234'
to: '212-555-1234'
```

---

## Next Steps

For comprehensive documentation including:

- All template operations
- Status tracking and queries
- Status enums and types
- Architecture overview
- Best practices

See the [Outbound Communications Guide](./outbound-communications-guide.md).

---

[Back to Examples](./README.md)
