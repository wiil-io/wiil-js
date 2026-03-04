# Dynamic Agent Setup Guide

**Simplified, single-call AI agent deployment**

This guide covers the Dynamic Agent Setup API - a streamlined approach to deploying AI agents that abstracts the multi-step configuration process into single API calls.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Quick Start](#quick-start)
3. [Phone Agent Setup](#phone-agent-setup)
4. [Web Agent Setup](#web-agent-setup)
5. [Updating Configurations](#updating-configurations)
6. [Voice Configuration (STT/TTS)](#voice-configuration-stttts)
7. [Role Templates & Capabilities](#role-templates--capabilities)
8. [Error Handling](#error-handling)
9. [Best Practices](#best-practices)

---

## Introduction

### What is Dynamic Agent Setup?

The Dynamic Agent Setup API provides a **simplified alternative** to the traditional [Fundamental Configuration Setup](./fundamental-configuration-setup.md) workflow. Instead of making 7+ separate API calls to create instruction configs, agent configs, deployment channels, and deployment configurations, you can deploy a fully functional AI agent with a single API call.

### Comparison

| Traditional Setup | Dynamic Setup |
| ----------------- | ------------- |
| 7+ separate API calls | Single API call |
| Create instruction config | Auto-generated |
| Create agent config | Auto-generated |
| Create deployment channel | Auto-generated |
| Create deployment config | Auto-generated |
| Manual linking | Automatic |

### When to Use Dynamic Setup

**Choose Dynamic Setup when:**

- Rapid prototyping and testing
- Standard use cases without complex customization
- Quick deployments for demos or MVPs
- You want simplicity over granular control

**Choose Traditional Setup when:**

- You need fine-grained control over each configuration
- Custom instruction configurations with detailed guidelines
- Complex multi-agent deployments
- Advanced deployment channel configurations

### Prerequisites

1. **WIIL Platform Account** - Sign up at [https://console.wiil.io](https://console.wiil.io)
2. **API Key** - Generate in **Settings** → **API Keys**
3. **SDK Installation**:

   ```bash
   npm install wiil-js
   # or
   yarn add wiil-js
   ```

---

## Quick Start

### Minimal Phone Agent

```typescript
import { WiilClient } from 'wiil-js';
import { BusinessSupportServices } from 'wiil-core-js';

const client = new WiilClient({
  apiKey: process.env.WIIL_API_KEY!
});

const result = await client.dynamicPhoneAgent.create({
  assistantName: 'Customer Support',
  capabilities: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
});

console.log('Phone number:', result.phoneNumber);
console.log('Agent ID:', result.agentConfigurationId);
```

### Minimal Web Agent

```typescript
import { WiilClient } from 'wiil-js';
import { BusinessSupportServices } from 'wiil-core-js';

const client = new WiilClient({
  apiKey: process.env.WIIL_API_KEY!
});

const result = await client.dynamicWebAgent.create({
  assistantName: 'Website Assistant',
  websiteUrl: 'https://example.com',
  capabilities: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
});

console.log('Integration snippets:', result.integrationSnippets);
console.log('Agent ID:', result.agentConfigurationId);
```

---

## Phone Agent Setup

### Overview

The Dynamic Phone Agent API provisions a phone-based AI agent with automatic phone number assignment.

### Required Fields

| Field | Type | Description |
| ----- | ---- | ----------- |
| `assistantName` | `string` | Name of the AI assistant |
| `capabilities` | `BusinessSupportServices[]` | Platform services enabled for this agent |

### Optional Fields

| Field | Type | Description |
| ----- | ---- | ----------- |
| `role_template_identifier` | `AgentRoleTemplateIdentifier` | Role/persona for the agent |
| `language` | `string` | Language code (default: `"en"`) |
| `phoneConfigurationId` | `string` | Existing phone configuration to use |
| `testPhoneNumber` | `string` | Phone number for testing |
| `instructionConfigurationId` | `string` | Existing instruction config to use |
| `knowledgeSourceIds` | `string[]` | Knowledge sources to associate |
| `voice` | `string` | Voice ID for the assistant |
| `providerType` | `SupportedProprietor` | AI model provider |
| `providerModelId` | `string` | Specific model ID |
| `sttConfiguration` | `object` | Speech-to-text config |
| `ttsConfiguration` | `object` | Text-to-speech config |

### Full Example with Voice

```typescript
import { WiilClient } from 'wiil-js';
import {
  BusinessSupportServices,
  AgentRoleTemplateIdentifier,
  SupportedProprietor
} from 'wiil-core-js';

const client = new WiilClient({
  apiKey: process.env.WIIL_API_KEY!
});

const result = await client.dynamicPhoneAgent.create({
  // Required
  assistantName: 'Premium Support Agent',
  capabilities: [
    BusinessSupportServices.APPOINTMENT_MANAGEMENT,
    BusinessSupportServices.PRODUCT_ORDER_MANAGEMENT
  ],

  // Optional - Role & Language
  role_template_identifier: AgentRoleTemplateIdentifier.CUSTOMER_SUPPORT_GENERAL,
  language: 'en-US',

  // Optional - Phone Configuration
  phoneConfigurationId: 'phone_config_123',

  // Optional - Voice Configuration
  sttConfiguration: {
    providerType: SupportedProprietor.DEEPGRAM,
    providerModelId: 'nova-2',
    languageId: 'en-US'
  },
  ttsConfiguration: {
    providerType: SupportedProprietor.ELEVENLABS,
    providerModelId: 'eleven_turbo_v2',
    languageId: 'en-US',
    voiceId: 'voice_rachel'
  }
});

console.log('Setup successful:', result.success);
console.log('Phone number:', result.phoneNumber);
console.log('Agent Config ID:', result.agentConfigurationId);
console.log('Instruction Config ID:', result.instructionConfigurationId);
```

### Result Type

The `DynamicPhoneAgentSetupResult` includes:

| Field | Type | Description |
| ----- | ---- | ----------- |
| `success` | `boolean` | Whether setup succeeded |
| `agentConfigurationId` | `string` | Created agent config ID |
| `instructionConfigurationId` | `string` | Created instruction config ID |
| `phoneNumber` | `string` | Provisioned phone number |
| `errorMessage` | `string?` | Error message if failed |
| `metadata` | `object?` | Additional metadata |

### CRUD Operations

```typescript
// Create
const created = await client.dynamicPhoneAgent.create({ ... });

// Get
const agent = await client.dynamicPhoneAgent.get('agent_123');

// Update (partial)
const updated = await client.dynamicPhoneAgent.update({
  id: 'agent_123',
  assistantName: 'Updated Name'
});

// Delete
const deleted = await client.dynamicPhoneAgent.delete('agent_123');
```

---

## Web Agent Setup

### Overview

The Dynamic Web Agent API provisions a web-based AI agent with integration snippets for website embedding.

### Required Fields

| Field | Type | Description |
| ----- | ---- | ----------- |
| `assistantName` | `string` | Name of the AI assistant |
| `websiteUrl` | `string` | URL of the website |
| `capabilities` | `BusinessSupportServices[]` | Platform services enabled |

### Optional Fields

| Field | Type | Description |
| ----- | ---- | ----------- |
| `communicationType` | `OttCommunicationType` | TEXT, VOICE, or UNIFIED (default: UNIFIED) |
| `role_template_identifier` | `AgentRoleTemplateIdentifier` | Role/persona for the agent |
| `language` | `string` | Language code (default: `"en"`) |
| `instructionConfigurationId` | `string` | Existing instruction config |
| `knowledgeSourceIds` | `string[]` | Knowledge sources |
| `voice` | `string` | Voice ID |
| `providerType` | `SupportedProprietor` | AI model provider |
| `providerModelId` | `string` | Specific model ID |
| `sttConfiguration` | `object` | Speech-to-text config |
| `ttsConfiguration` | `object` | Text-to-speech config |

### Communication Types

```typescript
import { OttCommunicationType } from 'wiil-core-js';

// Text-only chat
communicationType: OttCommunicationType.TEXT

// Voice-only interaction
communicationType: OttCommunicationType.VOICE

// Combined text and voice (default)
communicationType: OttCommunicationType.UNIFIED
```

### Full Example with Voice

```typescript
import { WiilClient } from 'wiil-js';
import {
  BusinessSupportServices,
  AgentRoleTemplateIdentifier,
  OttCommunicationType,
  SupportedProprietor
} from 'wiil-core-js';

const client = new WiilClient({
  apiKey: process.env.WIIL_API_KEY!
});

const result = await client.dynamicWebAgent.create({
  // Required
  assistantName: 'Voice-Enabled Web Agent',
  websiteUrl: 'https://example.com',
  capabilities: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],

  // Optional - Communication Type
  communicationType: OttCommunicationType.UNIFIED,

  // Optional - Role & Language
  role_template_identifier: AgentRoleTemplateIdentifier.CUSTOMER_SUPPORT_GENERAL,
  language: 'en-US',

  // Optional - Voice Configuration
  sttConfiguration: {
    providerType: SupportedProprietor.DEEPGRAM,
    providerModelId: 'nova-2',
    languageId: 'en-US'
  },
  ttsConfiguration: {
    providerType: SupportedProprietor.ELEVENLABS,
    providerModelId: 'eleven_turbo_v2',
    languageId: 'en-US',
    voiceId: 'voice_rachel'
  }
});

console.log('Setup successful:', result.success);
console.log('Agent Config ID:', result.agentConfigurationId);
console.log('Integration snippets:');
result.integrationSnippets.forEach((snippet, i) => {
  console.log(`  Snippet ${i + 1}:`, snippet);
});
```

### Result Type

The `DynamicWebAgentSetupResult` includes:

| Field | Type | Description |
| ----- | ---- | ----------- |
| `success` | `boolean` | Whether setup succeeded |
| `agentConfigurationId` | `string` | Created agent config ID |
| `instructionConfigurationId` | `string` | Created instruction config ID |
| `integrationSnippets` | `string[]` | Code snippets for embedding |
| `errorMessage` | `string?` | Error message if failed |
| `metadata` | `object?` | Additional metadata |

### Website Integration

Use the returned integration snippets in your HTML:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Website</title>
</head>
<body>
  <h1>Welcome to Our Website</h1>

  <!-- WIIL Widget - paste integration snippets here -->
  <script src="https://cdn.wiil.io/widget.js"></script>
  <div id="wiil-widget" data-agent="agent_123"></div>
  <script>WiilWidget.init({ agentId: "agent_123" });</script>
</body>
</html>
```

### CRUD Operations

```typescript
// Create
const created = await client.dynamicWebAgent.create({ ... });

// Get
const agent = await client.dynamicWebAgent.get('agent_123');

// Update (partial)
const updated = await client.dynamicWebAgent.update({
  id: 'agent_123',
  assistantName: 'Updated Name',
  communicationType: OttCommunicationType.TEXT
});

// Delete
const deleted = await client.dynamicWebAgent.delete('agent_123');

// Get integration snippets separately
const snippets = await client.dynamicWebAgent.getIntegrationSnippets('agent_123');
```

---

## Updating Configurations

### Partial Updates

Both phone and web agents support partial updates. Only include the fields you want to change, plus the required `id` field.

```typescript
// Update phone agent
const updatedPhone = await client.dynamicPhoneAgent.update({
  id: 'agent_123',
  assistantName: 'New Agent Name',
  language: 'es-MX'
});

// Update web agent
const updatedWeb = await client.dynamicWebAgent.update({
  id: 'agent_456',
  websiteUrl: 'https://new-website.com',
  communicationType: OttCommunicationType.VOICE
});
```

### Update Voice Configuration

```typescript
const updated = await client.dynamicPhoneAgent.update({
  id: 'agent_123',
  sttConfiguration: {
    providerType: SupportedProprietor.GOOGLE,
    providerModelId: 'chirp',
    languageId: 'en-US'
  },
  ttsConfiguration: {
    providerType: SupportedProprietor.ELEVENLABS,
    providerModelId: 'eleven_multilingual_v2',
    languageId: 'en-US',
    voiceId: 'voice_adam'
  }
});
```

---

## Voice Configuration (STT/TTS)

### Overview

Both phone and web agents support voice interactions through Speech-to-Text (STT) and Text-to-Speech (TTS) configurations.

**Important**: STT and TTS configurations must be provided together or neither. You cannot configure one without the other.

### STT Configuration

```typescript
sttConfiguration: {
  providerType: SupportedProprietor.DEEPGRAM,  // Required
  providerModelId: 'nova-2',                    // Required
  languageId: 'en-US'                           // Optional, default: 'en'
}
```

### TTS Configuration

```typescript
ttsConfiguration: {
  providerType: SupportedProprietor.ELEVENLABS, // Required
  providerModelId: 'eleven_turbo_v2',           // Required
  languageId: 'en-US',                          // Optional, default: 'en'
  voiceId: 'voice_rachel'                       // Optional
}
```

### Supported Providers

```typescript
import { SupportedProprietor } from 'wiil-core-js';

// Available providers
SupportedProprietor.OPENAI      // "OpenAI"
SupportedProprietor.GOOGLE      // "Google"
SupportedProprietor.ANTHROPIC   // "Anthropic"
SupportedProprietor.GROQ        // "Groq"
SupportedProprietor.DEEPGRAM    // "Deepgram" - Recommended for STT
SupportedProprietor.ELEVENLABS  // "ElevenLabs" - Recommended for TTS
SupportedProprietor.DEEPSEEK    // "DeepSeek"
SupportedProprietor.CARTESIA    // "Cartesia"
```

### Recommended Configurations

**For STT (Speech-to-Text):**

```typescript
sttConfiguration: {
  providerType: SupportedProprietor.DEEPGRAM,
  providerModelId: 'nova-2',
  languageId: 'en-US'
}
```

**For TTS (Text-to-Speech):**

```typescript
ttsConfiguration: {
  providerType: SupportedProprietor.ELEVENLABS,
  providerModelId: 'eleven_turbo_v2',
  languageId: 'en-US',
  voiceId: 'voice_rachel'  // Choose appropriate voice
}
```

---

## Role Templates & Capabilities

### Agent Role Templates

Role templates define the agent's persona and behavior style:

```typescript
import { AgentRoleTemplateIdentifier } from 'wiil-core-js';

// Available role templates
AgentRoleTemplateIdentifier.CUSTOMER_SUPPORT_GENERAL      // General customer support
AgentRoleTemplateIdentifier.TECHNICAL_SUPPORT_SPECIALIST  // Technical assistance
AgentRoleTemplateIdentifier.SALES_REPRESENTATIVE          // Sales and lead generation
AgentRoleTemplateIdentifier.ONBOARDING_SPECIALIST         // Customer onboarding
AgentRoleTemplateIdentifier.BILLING_SUPPORT_SPECIALIST    // Billing and payments
```

### Business Capabilities

Capabilities define which platform services (tools) the agent can use:

```typescript
import { BusinessSupportServices } from 'wiil-core-js';

// Available capabilities
BusinessSupportServices.APPOINTMENT_MANAGEMENT    // Appointment scheduling
BusinessSupportServices.INVENTORY_MANAGEMENT      // Inventory tracking
BusinessSupportServices.MENU_ORDER_MANAGEMENT     // Restaurant menu orders
BusinessSupportServices.PRODUCT_ORDER_MANAGEMENT  // Product/retail orders
BusinessSupportServices.RESERVATION_MANAGEMENT    // Table/room reservations
BusinessSupportServices.PROPERTY_MANAGEMENT       // Property listings
BusinessSupportServices.NONE                      // No business services
```

### Example: E-commerce Support Agent

```typescript
const result = await client.dynamicWebAgent.create({
  assistantName: 'E-commerce Support',
  websiteUrl: 'https://shop.example.com',
  capabilities: [
    BusinessSupportServices.PRODUCT_ORDER_MANAGEMENT,
    BusinessSupportServices.INVENTORY_MANAGEMENT
  ],
  role_template_identifier: AgentRoleTemplateIdentifier.CUSTOMER_SUPPORT_GENERAL
});
```

### Example: Restaurant Agent

```typescript
const result = await client.dynamicPhoneAgent.create({
  assistantName: 'Restaurant Reservations',
  capabilities: [
    BusinessSupportServices.RESERVATION_MANAGEMENT,
    BusinessSupportServices.MENU_ORDER_MANAGEMENT
  ],
  role_template_identifier: AgentRoleTemplateIdentifier.CUSTOMER_SUPPORT_GENERAL
});
```

---

## Error Handling

### Error Types

```typescript
import {
  WiilAPIError,
  WiilValidationError,
  WiilNetworkError
} from 'wiil-js';

try {
  const result = await client.dynamicPhoneAgent.create({
    assistantName: 'Support Agent',
    capabilities: [BusinessSupportServices.APPOINTMENT_MANAGEMENT]
  });
} catch (error) {
  if (error instanceof WiilValidationError) {
    // Invalid input data
    console.error('Validation failed:', error.details);
  } else if (error instanceof WiilAPIError) {
    // API returned an error
    console.error(`API Error ${error.statusCode}:`, error.message);
  } else if (error instanceof WiilNetworkError) {
    // Network connectivity issue
    console.error('Network error:', error.message);
  }
}
```

### Common Errors

| Error | Cause | Solution |
| ----- | ----- | -------- |
| 400 Bad Request | Invalid input data | Check required fields and enum values |
| 401 Unauthorized | Invalid API key | Verify API key is correct and active |
| 404 Not Found | Agent ID doesn't exist | Verify the agent ID is correct |
| 422 Validation Error | STT/TTS mismatch | Provide both STT and TTS configs together |

### STT/TTS Validation

Both configurations must be provided together or neither:

```typescript
// Valid: Both provided
{
  sttConfiguration: { ... },
  ttsConfiguration: { ... }
}

// Valid: Neither provided
{
  // No STT/TTS config
}

// Invalid: Only one provided - will throw validation error
{
  sttConfiguration: { ... }
  // Missing ttsConfiguration
}
```

---

## Best Practices

### 1. Naming Conventions

Use descriptive, consistent names:

```typescript
// Good
assistantName: 'Customer Support - Premium Tier'
assistantName: 'Sales Bot - Lead Qualification'
assistantName: 'Booking Assistant - Restaurant'

// Avoid
assistantName: 'bot1'
assistantName: 'test'
```

### 2. Choose Appropriate Capabilities

Only enable capabilities the agent will actually use:

```typescript
// Good - specific capabilities for use case
capabilities: [BusinessSupportServices.APPOINTMENT_MANAGEMENT]

// Avoid - enabling everything
capabilities: [
  BusinessSupportServices.APPOINTMENT_MANAGEMENT,
  BusinessSupportServices.INVENTORY_MANAGEMENT,
  BusinessSupportServices.MENU_ORDER_MANAGEMENT,
  BusinessSupportServices.PRODUCT_ORDER_MANAGEMENT,
  BusinessSupportServices.RESERVATION_MANAGEMENT,
  BusinessSupportServices.PROPERTY_MANAGEMENT
]
```

### 3. Web vs Phone Channel Selection

**Use Phone Agent when:**

- Primary interaction is voice calls
- Customers prefer phone support
- Complex issues requiring real-time conversation
- Accessibility requirements

**Use Web Agent when:**

- Website-based customer support
- E-commerce and online services
- Need text and/or voice options
- Integration with web applications

### 4. Voice Configuration

- Use Deepgram Nova-2 for high-quality STT
- Use ElevenLabs for natural-sounding TTS
- Match language IDs across STT and TTS
- Test voice quality in development environment

### 5. Error Handling

Always implement comprehensive error handling in production:

```typescript
async function createAgent() {
  try {
    const result = await client.dynamicPhoneAgent.create({ ... });

    if (!result.success) {
      console.error('Setup failed:', result.errorMessage);
      return null;
    }

    return result;
  } catch (error) {
    // Handle specific error types
    throw error;
  }
}
```

---

## Support & Resources

### Documentation

- **Platform Docs**: [https://docs.wiil.io](https://docs.wiil.io)
- **API Reference**: [https://docs.wiil.io/developer/api-reference](https://docs.wiil.io/developer/api-reference)
- **SDK Reference**: [https://github.com/wiil-io/wiil-js](https://github.com/wiil-io/wiil-js)

### Support

- **Email**: [dev-support@wiil.io](mailto:dev-support@wiil.io)
- **Console**: [https://console.wiil.io](https://console.wiil.io)
- **GitHub Issues**: [https://github.com/wiil-io/wiil-js/issues](https://github.com/wiil-io/wiil-js/issues)

### Related Guides

- [Fundamental Configuration Setup](./fundamental-configuration-setup.md) - Traditional multi-step setup
- [Voice Channels](./channels/voice-channels.md) - Phone call integration
- [Web Channels](./channels/web-channels.md) - Web chat widget integration

---

*Built with the WIIL team*
