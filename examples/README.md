# WIIL JavaScript SDK Examples

This directory contains comprehensive examples and guides for building AI-powered conversational services using the WIIL JavaScript SDK.

## Table of Contents

- [Getting Started](#getting-started)
- [Quick Start Guide](#quick-start-guide)
- [Core Guides](#core-guides)
- [Business Service Guides](#business-service-guides)
- [Configuration Flow](#configuration-flow)
- [Best Practices](#best-practices)

---

## Getting Started

### Prerequisites

1. **WIIL Platform Account**
   - Sign up at [https://console.wiil.io](https://console.wiil.io)
   - Complete email verification

2. **API Key**
   - Navigate to **Settings** → **API Keys** in WIIL Console
   - Generate and securely store your API key

3. **Development Environment**
   - Node.js 16.x or higher
   - npm or yarn package manager

### Installation

```bash
npm install wiil-js
# or
yarn add wiil-js
```

### Environment Setup

Create a `.env` file in your project root:

```env
WIIL_API_KEY=your-api-key-here
```

**Security Note**: Never commit `.env` to version control. Add it to `.gitignore`.

---

## Quick Start Guide

### Fundamental Configuration Setup

**File**: [fundamental-configuration-setup.md](./fundamental-configuration-setup.md)

Complete walkthrough from signup to deploying your first AI agent.

This is the **recommended starting point** for all new users. It covers:

1. **Initialize Client & Verify Organization**
2. **Create or Select Project**
3. **Create Instruction Configuration** (agent behavior and guidelines)
4. **Get AI Models** from Wiil Support Model Registry
5. **Create Agent Configuration** (link instructions + model)
6. **Create Deployment Channel** (web, phone, SMS)
7. **Create Deployment Configuration** (link everything together)
8. **Deploy Agent** (integrate into your application)
9. **Verify Deployment** (test and monitor)

[📖 Read the Full Guide](./fundamental-configuration-setup.md)

---

## Core Guides

### Channels

**Directory**: [channels/](./channels/)

Guides for setting up different communication channels:

- **[README.md](./channels/README.md)** - Channel overview and concepts
- **[Understanding Channels](./channels/understanding-channels.md)** - Channel types and architecture
- **[Web Channels](./channels/web-channels.md)** - Web chat widget integration
- **[Voice Channels](./channels/voice-channels.md)** - Phone call integration
- **[SMS Channels](./channels/sms-channels.md)** - Text messaging integration
- **[Troubleshooting](./channels/troubleshooting.md)** - Common channel issues

---

## Business Service Guides

**Directory**: [business-services/](./business-services/)

Guides for managing business operations and customer transactions:

### Services & Appointments

**File**: [services-and-appointments-guide.md](./business-services/services-and-appointments-guide.md)

Manage professional services and appointment bookings:

- Service configuration (haircuts, consultations, etc.)
- Appointment scheduling and management
- Calendar integration
- Status tracking

### Menus & Orders

**File**: [menus-and-orders-guide.md](./business-services/menus-and-orders-guide.md)

Restaurant and food service management:

- Menu categories and items
- Nutritional information and allergens
- Order creation and tracking (dine-in, takeout, delivery)
- Order status management

### Products & Orders

**File**: [products-and-orders-guide.md](./business-services/products-and-orders-guide.md)

Retail product and order management:

- Product catalogs and categories
- Inventory tracking (SKU, barcode, stock levels)
- Product orders and fulfillment
- Shipping and tracking

### Reservations

**File**: [reservations-guide.md](./business-services/reservations-guide.md)

Resource reservation management:

- Reservation resources (tables, rooms, rentals)
- Customer reservations and bookings
- Capacity management
- Calendar sync

---

## Configuration Flow

Understanding how configurations relate to each other:

```
Organization
    │
    └─→ Project (e.g., "Customer Support")
           │
           ├─→ Instruction Configuration
           │   └─→ Defines: Role, behavior, guidelines, guardrails
           │
           ├─→ Support Models (from registry)
           │   └─→ Available AI models from various providers
           │
           ├─→ Agent Configuration
           │   └─→ Links: Model + Instructions
           │
           ├─→ Deployment Channel
           │   └─→ Defines: Channel type (WEB, CALLS, SMS)
           │
           └─→ Deployment Configuration
               └─→ Links: Agent + Instructions + Channel → Live Agent
```

### Setup Order

Follow this chronological order for initial setup:

1. **Initialize Client** → Verify Organization
2. **Create/Select Project** → Organizational grouping
3. **Create Instruction Configuration** → Agent behavior (required first)
4. **Get Support Models** → Choose AI model
5. **Create Agent Configuration** → Link instructions + model
6. **Create Deployment Channel** → Communication method (required first)
7. **Create Deployment Configuration** → Link agent + channel
8. **Deploy & Integrate** → Add to your application

---

## Best Practices

### 1. Instruction Configuration

**Be Specific and Comprehensive:**

```typescript
const instructions = await client.instructionConfigs.create({
  instructionName: 'customer-support-agent',
  role: 'Customer Support Specialist',
  introductionMessage: 'Hello! How can I help you today?',

  // Detailed behavior guidelines
  instructions: `
    Your role and responsibilities:
    - Greet customers warmly and professionally
    - Answer questions about products and services
    - Help with bookings and reservations
    - Escalate complex issues appropriately

    Communication style:
    - Professional yet friendly
    - Clear and concise
    - Patient and empathetic
  `,

  // Safety and compliance
  guardrails: `
    Data Privacy:
    - Never share sensitive information
    - Follow GDPR regulations

    Escalation Triggers:
    - Customer requests human agent
    - Keywords: complaint, refund, legal
  `
});
```

### 2. Error Handling

Always implement comprehensive error handling:

```typescript
import {
  WiilAPIError,
  WiilValidationError,
  WiilNetworkError
} from 'wiil-js';

try {
  const deployment = await client.deploymentConfigs.create({
    // ... configuration
  });
} catch (error) {
  if (error instanceof WiilValidationError) {
    console.error('Invalid configuration:', error.details);
  } else if (error instanceof WiilAPIError) {
    console.error(`API Error ${error.statusCode}:`, error.message);
  } else if (error instanceof WiilNetworkError) {
    console.error('Network error. Check your connection.');
  }
}
```

### 3. Model Selection

Choose the right model for your use case:

```typescript
// For conversational AI (text, voice, vision)
const defaultModel = await client.supportModels.getDefaultMultiMode();

// For specific providers
const geminiModel = await client.supportModels.getByProprietorAndProviderModelId(
  'Google',
  'gemini-2.0-flash-exp'
);

// For voice applications
const ttsModel = await client.supportModels.getDefaultTTS();
const sttModel = await client.supportModels.getDefaultSTT();
```

### 4. Channel Configuration

**Web Chat:**

```typescript
const webChannel = await client.deploymentChannels.create({
  channelName: 'Website Live Chat',
  deploymentType: 'WEB',
  channelIdentifier: 'web-chat-01',
  recordingEnabled: true,
  configuration: {
    communicationType: 'TEXT',  // TEXT, VOICE, or UNIFIED
    widgetConfiguration: {
      position: 'right'  // left or right
    }
  }
});
```

**Voice (Phone):**

```typescript
const voiceChannel = await client.deploymentChannels.create({
  channelName: 'Support Hotline',
  deploymentType: 'CALLS',
  channelIdentifier: '+15551234567',
  recordingEnabled: true,
  configuration: {
    communicationType: 'VOICE'
  }
});
```

### 5. Business Services Integration

When building transactional agents, configure business services:

```typescript
// Service appointments
const service = await client.services.create({
  name: 'Hair Styling',
  description: 'Professional hair styling service',
  duration: 60,
  price: 75.00
});

// Menu items for restaurants
const menuItem = await client.menus.createItem({
  name: 'Cheeseburger',
  price: 12.99,
  categoryId: 'category_main'
});

// Products for retail
const product = await client.products.create({
  name: 'Wireless Mouse',
  price: 29.99,
  trackInventory: true,
  stockQuantity: 150
});

// Reservation resources
const table = await client.reservationResources.create({
  resourceType: 'table',
  name: 'Table 5',
  capacity: 4
});
```

---

## Monitoring and Analytics

After deployment, monitor your agent's performance in the WIIL Console:

### WIIL Console Dashboards

- Navigate to **Analytics** → **Conversations**
- View real-time conversation logs
- Track performance metrics
- Export data for analysis

---

## Integration Examples

### HTML Web Chat Widget

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Website</title>
</head>
<body>
  <h1>Welcome to ACME Corporation</h1>

  <!-- WIIL Widget -->
  <div
    id="wiil-widget"
    data-config-id="your-deployment-config-id"
    data-features="chat,voice"
  ></div>
  <script src="https://cdn.wiil.io/public/wiil-widget.js"></script>
  <script>WiilWidget.init();</script>
</body>
</html>
```

### React Integration

```tsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const widgetDiv = document.createElement('div');
    widgetDiv.id = 'wiil-widget';
    widgetDiv.setAttribute('data-config-id', 'your-deployment-config-id');
    widgetDiv.setAttribute('data-features', 'chat,voice');
    document.body.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.src = 'https://cdn.wiil.io/public/wiil-widget.js';
    script.async = true;
    script.onload = () => window.WiilWidget.init();
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(widgetDiv);
      document.body.removeChild(script);
    };
  }, []);

  return <div className="App">Your content</div>;
}
```

---

## Troubleshooting

### Common Issues

#### Problem: API Key Authentication Failed

```text
Error: 401 Unauthorized
```

**Solution**: Verify your API key is correct and active in WIIL Console.

#### Problem: Deployment Not Active

```text
Error: Deployment configuration is not active
```

**Solution**: Ensure `isActive: true` when creating deployment configuration.

#### Problem: Widget Not Appearing

```text
Widget script loaded but no UI visible
```

**Solution**:

- Check `data-config-id` matches your deployment
- Verify deployment status is ACTIVE in console
- Check browser console for errors

For channel-specific issues, see [Channel Troubleshooting Guide](./channels/troubleshooting.md).

---

## Support & Resources

### Documentation

- **Platform Docs**: [https://docs.wiil.io](https://docs.wiil.io)
- **API Reference**: [https://docs.wiil.io/developer/api-reference](https://docs.wiil.io/developer/api-reference)
- **SDK Reference**: [https://github.com/wiil-io/wiil-js](https://github.com/wiil-io/wiil-js)

### Support Channels

- **Email**: [dev-support@wiil.io](mailto:dev-support@wiil.io)
- **Console**: [https://console.wiil.io](https://console.wiil.io)
- **GitHub Issues**: [https://github.com/wiil-io/wiil-js/issues](https://github.com/wiil-io/wiil-js/issues)

### Community

- **Discord**: Join our developer community
- **Blog**: Technical articles and best practices
- **Changelog**: Stay updated with new features

---

## Contributing

Found an issue or want to add a new example? Please submit a pull request or open an issue on GitHub.

---

## Ready to Get Started?

Begin with the [Fundamental Configuration Setup Guide](./fundamental-configuration-setup.md) to deploy your first AI agent! 🚀

---

*Built with ❤️ by the WIIL team*
