# Messaging Guide

This guide covers sending outbound messages using the WIIL Platform JS SDK. The messaging service supports AI-powered phone calls, SMS text messages, and emails.

## Quick Start

```typescript
import { WiilService } from 'wiil-js';

const service = new WiilService({
  apiKey: 'your-api-key',
});

// Send an SMS
const sms = await service.messaging.sendSms({
  to: '+12125551234',
  body: 'Your appointment is confirmed for tomorrow at 3 PM.',
});

console.log('SMS sent:', sms.id);
```

## Request a Call

Initiate an AI-powered outbound phone call:

```typescript
const call = await service.messaging.requestCall({
  to: '+12125551234',
  from: '+12125559999',
  agentConfigurationId: 'agent_456',
  scheduleType: 'IMMEDIATE',
});

console.log('Call requested:', call.id);
console.log('Status:', call.status);
```

### Scheduled Call with Calling Hours

```typescript
const scheduledCall = await service.messaging.requestCall({
  to: '+12125551234',
  from: '+12125559999',
  agentConfigurationId: 'agent_456',
  scheduleType: 'SCHEDULED',
  scheduledAt: Date.now() + 3600000, // 1 hour from now
  callingHours: {
    startTime: '09:00',
    endTime: '17:00',
    daysOfWeek: [1, 2, 3, 4, 5], // Monday-Friday
  },
  maxRetries: 3,
  retryDelayMinutes: 30,
});
```

## Send SMS

Send a text message with optional template variables:

```typescript
const sms = await service.messaging.sendSms({
  to: '+12125551234',
  body: 'Hi {{firstName}}, your code is {{code}}.',
  variables: {
    firstName: 'John',
    code: '123456',
  },
});

console.log('SMS sent:', sms.id);
```

### Scheduled SMS

```typescript
const scheduledSms = await service.messaging.sendSms({
  to: '+12125551234',
  body: 'Reminder: Your appointment is in 1 hour.',
  scheduledAt: Date.now() + 3600000,
});
```

## Send Email

Send an email with HTML content:

```typescript
const email = await service.messaging.sendEmail({
  to: [{ email: 'customer@example.com', name: 'John Smith' }],
  subject: 'Order Confirmation - #{{orderId}}',
  bodyHtml: '<h1>Thank you, {{name}}!</h1><p>Your order has been confirmed.</p>',
  variables: {
    orderId: '12345',
    name: 'John',
  },
});

console.log('Email sent:', email.id);
```

### Email with CC and Attachments

```typescript
import * as fs from 'fs';

const pdfContent = fs.readFileSync('invoice.pdf').toString('base64');

const email = await service.messaging.sendEmail({
  to: [{ email: 'customer@example.com', name: 'Customer' }],
  cc: [{ email: 'sales@company.com' }],
  replyTo: 'support@company.com',
  subject: 'Your Invoice',
  bodyHtml: '<p>Please find your invoice attached.</p>',
  bodyText: 'Please find your invoice attached.',
  attachments: [
    {
      filename: 'invoice.pdf',
      content: pdfContent,
      contentType: 'application/pdf',
    },
  ],
});
```

## Schedule Types

| Type | Description |
|------|-------------|
| `IMMEDIATE` | Execute as soon as possible within calling hours |
| `SCHEDULED` | Execute at specific `scheduledAt` timestamp |
| `RECURRING` | Execute on `callingHours` schedule pattern |

## Complete Example

```typescript
import { WiilService } from 'wiil-js';

const service = new WiilService({
  apiKey: process.env.WIIL_API_KEY!,
});

async function sendNotifications(customerId: string, appointmentTime: string) {
  // Send confirmation SMS
  const sms = await service.messaging.sendSms({
    to: '+12125551234',
    body: `Your appointment is confirmed for ${appointmentTime}.`,
  });
  console.log('SMS sent:', sms.id);

  // Send confirmation email
  const email = await service.messaging.sendEmail({
    to: [{ email: 'customer@example.com' }],
    subject: 'Appointment Confirmed',
    bodyHtml: `<p>Your appointment is confirmed for <strong>${appointmentTime}</strong>.</p>`,
  });
  console.log('Email sent:', email.id);

  // Schedule reminder call 1 hour before
  const reminderTime = new Date(appointmentTime).getTime() - 3600000;
  const call = await service.messaging.requestCall({
    to: '+12125551234',
    from: '+12125559999',
    agentConfigurationId: 'reminder_agent',
    scheduleType: 'SCHEDULED',
    scheduledAt: reminderTime,
  });
  console.log('Reminder call scheduled:', call.id);
}

sendNotifications('cust_123', '2024-12-20T15:00:00Z').catch(console.error);
```
