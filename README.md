# WIIL JavaScript SDK

Ship AI-powered business features without building telecom, catalog infrastructure, or integration plumbing.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

## What You Can Ship

This SDK gives you APIs to build:

- **Catalog-aware AI agents** — Agents grounded in real business data (menus, products, services, properties)
- **Multi-channel conversations** — Web, phone, SMS, email through unified APIs
- **Transaction workflows** — Appointments, reservations, orders, inquiries
- **Outbound communications** — Automated calls, emails, SMS without provider setup

What you skip building:

- Telephony integration, SMS gateways, SMTP servers
- Voice pipeline (STT → LLM → TTS)
- Catalog schema design and multi-location logic
- Retry logic, queue management, delivery tracking
- Channel-specific protocols and failure handling

**You write the business logic. The SDK handles the infrastructure.**

---

## Installation

```bash
npm install wiil-js
```

---

## Quick Start

```typescript
import { WiilClient } from 'wiil-js';

const client = new WiilClient({
  apiKey: process.env.WIIL_API_KEY!
});
```

### Deploy an AI Agent (One Call)

```typescript
import { BusinessSupportServices } from 'wiil-core-js';

// Phone agent with live number
const phone = await client.dynamicPhoneAgent.create({
  assistantName: 'Sarah',
  capabilities: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
});
console.log('Phone number:', phone.phoneNumber);

// Web agent with widget
const web = await client.dynamicWebAgent.create({
  assistantName: 'Emma',
  websiteUrl: 'https://example.com',
  capabilities: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
});
console.log('Widget snippets:', web.integrationSnippets);
```

### Send Notifications (No Provider Setup)

```typescript
// Email
await client.outboundEmails.create({
  to: [{ email: 'customer@example.com' }],
  templateId: 'order_confirmation',
  templateVariables: { orderNumber: 'ORD-123', total: '99.99' },
});

// SMS
await client.outboundSms.create({
  to: '+14155551234',
  from: '+14155555678',
  body: 'Your appointment is confirmed for tomorrow at 2 PM.',
});

// Voice call
await client.outboundCalls.create({
  to: '+14155551234',
  from: '+14155555678',
  agentConfigurationId: 'reminder_agent',
  scheduleType: 'scheduled',
  scheduledAt: Date.now() + (2 * 60 * 60 * 1000),
});
```

### Manage Business Catalogs

```typescript
// Services
const service = await client.services.create({
  name: 'Hair Styling',
  duration: 60,
  basePrice: 75.00,
});

// Menu items (with variants)
const menuItem = await client.menuItems.create({
  name: 'Cheeseburger',
  categoryId: 'cat_main',
  variants: [{ name: 'Regular', price: 12.99, isDefault: true, isActive: true, isAvailable: true }],
});

// Products (with variants)
const product = await client.products.create({
  name: 'Wireless Mouse',
  categoryId: 'cat_electronics',
  isAlcoholic: false,
  variants: [{ axisValues: {}, price: 29.99, isDefault: true, isActive: true }],
});
```

### Book Transactions Through AI

```typescript
// Appointment
const appointment = await client.serviceAppointments.create({
  businessServiceId: service.id,
  customerId: 'cust_123',
  startsAt: Date.now() + (24 * 60 * 60 * 1000),
  duration: 60,
});

// Table reservation
const reservation = await client.tableReservations.create({
  floorPlanId: 'floor_main',
  customerId: 'cust_123',
  time: Date.now() + (2 * 60 * 60 * 1000),
  duration: 90,
  personsNumber: 4,
});
```

---

## Examples & Guides

Comprehensive guides are in the [`examples/`](./examples/) directory:

### Getting Started

| Guide | What You'll Build |
| ----- | ----------------- |
| [Dynamic Agent Setup](./examples/dynamic-agent-setup-guide.md) | Deploy phone/web agents in one API call |
| [Fundamental Configuration](./examples/fundamental-configuration-setup.md) | Fine-grained multi-step agent setup |

### Outbound Communications

| Guide | What You'll Build |
| ----- | ----------------- |
| [Outbound Communications](./examples/outbound-communications-guide.md) | Full notification system — calls, email, SMS |
| [Messaging Quick Start](./examples/messaging-guide.md) | Send your first notification in minutes |

### Business Services

| Guide | What You'll Build |
| ----- | ----------------- |
| [Services & Appointments](./examples/business-services/services-and-appointments-guide.md) | Bookable services, appointment scheduling |
| [Menus & Orders](./examples/business-services/menus-and-orders-guide.md) | Restaurant menus, food ordering |
| [Products & Orders](./examples/business-services/products-and-orders-guide.md) | Product catalogs, retail orders |
| [Reservations](./examples/business-services/reservations-guide.md) | Tables, rooms, rentals |
| [Property Management](./examples/business-services/property-management-guide.md) | Listings, inquiries, lead tracking |

### Channels

| Guide | What You'll Build |
| ----- | ----------------- |
| [Web Channels](./examples/channels/web-channels.md) | Chat widget integration |
| [Voice Channels](./examples/channels/voice-channels.md) | Phone call handling |
| [SMS Channels](./examples/channels/sms-channels.md) | Text messaging |

[**See all examples →**](./examples/README.md)

---

## SDK Features

- **Type-Safe** — Full TypeScript with comprehensive type definitions
- **Validated** — Runtime validation using Zod schemas
- **Production-Grade** — Robust error handling, configurable timeouts
- **Modern** — ES2023, async/await, Promise-based

---

## Available Resources

### Dynamic Agent Setup

```typescript
client.dynamicPhoneAgent  // Single-call phone agent deployment
client.dynamicWebAgent    // Single-call web agent deployment
```

### Outbound APIs

```typescript
client.outboundTemplates  // Email/SMS templates
client.outboundCalls      // Automated voice calls
client.outboundEmails     // Transactional emails
client.outboundSms        // SMS messages
```

### Service Configuration

```typescript
client.agentConfigs         // Agent configurations
client.instructionConfigs   // Agent behavior/prompts
client.deploymentConfigs    // Deployment configurations
client.deploymentChannels   // Communication channels
client.provisioningConfigs  // STT/TTS chain configs
client.supportModels        // AI model registry
client.telephonyProvider    // Phone number provisioning
```

### Business Management

```typescript
client.services             // Business services
client.customers            // Customer management
client.menuCategories       // Menu categories
client.menuItems            // Menu items with variants
client.products             // Products with variants
client.serviceAppointments  // Appointment bookings
client.tableReservations    // Table reservations
client.roomReservations     // Room reservations
client.rentalReservations   // Rental reservations
client.menuOrders           // Menu orders
client.productOrders        // Product orders
client.floorPlans           // Floor plans and tables
client.propertyConfig       // Property listings
client.propertyInquiries    // Property inquiries
```

---

## Error Handling

```typescript
import {
  WiilAPIError,
  WiilValidationError,
  WiilNetworkError
} from 'wiil-js';

try {
  const result = await client.services.create({ ... });
} catch (error) {
  if (error instanceof WiilValidationError) {
    console.error('Invalid input:', error.details);
  } else if (error instanceof WiilAPIError) {
    console.error(`API Error ${error.statusCode}:`, error.message);
  } else if (error instanceof WiilNetworkError) {
    console.error('Network error — retry the request');
  }
}
```

---

## Configuration

```typescript
const client = new WiilClient({
  apiKey: process.env.WIIL_API_KEY!,
  baseUrl: 'https://api.wiil.io/v1',  // Optional
  timeout: 60000                       // Optional, ms
});
```

---

## Security

**Server-side only.** Never expose your API key in client-side code.

```typescript
// ✅ Good — environment variable
const client = new WiilClient({
  apiKey: process.env.WIIL_API_KEY!
});

// ❌ Bad — hardcoded key
const client = new WiilClient({
  apiKey: 'sk_live_...'  // Never do this
});
```

---

## Requirements

- Node.js 16.x or higher
- TypeScript 5.x (for TypeScript projects)

---

## Development

```bash
npm run build          # Build
npm test               # Run tests
npm run test:coverage  # Tests with coverage
```

---

## Support

- **Documentation**: [https://docs.wiil.io](https://docs.wiil.io)
- **API Reference**: [https://docs.wiil.io/developer/api-reference](https://docs.wiil.io/developer/api-reference)
- **Issues**: [GitHub Issues](https://github.com/wiil-io/wiil-js/issues)
- **Email**: [dev-support@wiil.io](mailto:dev-support@wiil.io)

---

## License

MIT © [WIIL](https://wiil.io)

---

Built with care by the WIIL team
