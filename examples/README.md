# WIIL JavaScript SDK Examples

This directory contains comprehensive examples demonstrating how to use the WIIL JavaScript SDK to build AI-powered conversational services.

## Getting Started

### Prerequisites

1. **Sign up for WIIL Platform**: Visit [https://console.wiil.io](https://console.wiil.io)
2. **Obtain your API key**: Available in your WIIL Console dashboard
3. **Install the SDK**:
   ```bash
   npm install wiil-js
   ```

### Environment Setup

Create a `.env` file in your project root:

```env
WIIL_API_KEY=your-api-key-here
```

## Examples

### 1. Fundamental Configuration Setup

**File**: `fundamental-configuration-setup.ts`

**Description**: Complete, step-by-step guide from signup to deploying your first AI agent.

**What you'll learn**:
- Initialize the WIIL client
- Verify your organization
- Create/select projects
- Configure AI agents
- Define agent instructions and behavior
- Create deployment configurations
- Set up communication channels
- Deploy agents

**Run the example**:
```bash
# Using ts-node
npx ts-node examples/fundamental-configuration-setup.ts

# Or compile and run
npx tsc examples/fundamental-configuration-setup.ts
node examples/fundamental-configuration-setup.js
```

**Expected Output**:
```
================================================================================
WIIL Platform - Fundamental Configuration Setup
From Signup to Agent Deployment
================================================================================

STEP 1: Initialize Client & Verify Organization
--------------------------------------------------------------------------------
✓ Organization verified:
  - Company Name: ACME Company
  - Organization ID: org_123456
  - Service Status: ACTIVE

STEP 2: Create or Select Project
--------------------------------------------------------------------------------
✓ Using existing default project:
  - Project Name: Customer Support
  - Project ID: proj_123456

...

SETUP COMPLETE!
```

## Example Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    FUNDAMENTAL SETUP FLOW                        │
└─────────────────────────────────────────────────────────────────┘

1. Initialize Client
   │
   ├─→ Verify Organization
   │
   ▼
2. Create/Select Project
   │
   ├─→ Customer Support
   │
   ▼
3. Create Agent Configuration
   │
   ├─→ Define AI model (GPT-4)
   ├─→ Set temperature & parameters
   ├─→ Define capabilities
   │
   ▼
4. Create Instruction Configuration
   │
   ├─→ System prompt
   ├─→ Conversation guidelines
   ├─→ Compliance rules
   ├─→ Escalation criteria
   │
   ▼
5. Create Deployment Configuration
   │
   ├─→ Link Agent + Instructions
   ├─→ Configure settings
   │
   ▼
6. Create Deployment Channel
   │
   ├─→ Choose channel type (Web Chat)
   ├─→ Configure appearance
   ├─→ Set business hours
   │
   ▼
7. Deploy Agent
   │
   ├─→ Activate deployment
   ├─→ Generate integration code
   │
   ▼
8. Verify Deployment
   │
   └─→ Agent is live! 🚀
```

## Configuration Hierarchy

Understanding the relationship between configurations:

```
Organization
    │
    └─→ Project (Customer Support)
           │
           ├─→ Agent Configuration
           │   └─→ Defines: Model, capabilities, parameters
           │
           ├─→ Instruction Configuration
           │   └─→ Defines: Behavior, guidelines, rules
           │
           └─→ Deployment Configuration
               ├─→ Links: Agent + Instructions
               │
               └─→ Deployment Channel
                   └─→ Defines: Channel type, settings, integration
```

## Common Use Cases

### Web Chat Integration

After running `fundamental-configuration-setup.ts`, integrate the chat widget:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <!-- Your website content -->

  <!-- WIIL Chat Widget -->
  <script src="https://cdn.wiil.io/chat-widget.js"></script>
  <script>
    WiilChat.init({
      channelId: "your-channel-id",
      apiKey: "your-public-api-key"
    });
  </script>
</body>
</html>
```

### Telephony Integration

For voice-based channels:

```typescript
const phoneChannel = await client.deploymentChannels.create({
  name: 'Customer Support Phone Line',
  channelType: 'TELEPHONY',
  deploymentConfigId: deploymentConfig.id,
  channelConfig: {
    phoneNumber: '+1-555-123-4567',
    greeting: 'Thank you for calling ACME Company. How may I assist you?',
    voiceConfig: {
      sttModelId: 'deepgram-nova-2',
      ttsModelId: 'elevenlabs-v2',
      voiceId: 'professional-male',
      language: 'en-US'
    }
  },
  isActive: true
});
```

## Best Practices

### 1. Instruction Versioning

Maintain version history for instruction configurations:

```typescript
const instructionV2 = await client.instructionConfigs.create({
  name: 'Customer Support Instructions v2.0',
  description: 'Updated guidelines with improved escalation logic',
  systemPrompt: '...',
  version: '2.0.0',
  previousVersionId: instructionV1.id
});
```

### 2. Error Handling

Always implement proper error handling:

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
    console.error('Network error. Please check your connection.');
  }
}
```

## Monitoring and Analytics

After deployment, monitor your agent's performance in the WIIL Console:

- **Conversation Metrics**: Volume, duration, completion rate
- **Sentiment Analysis**: Customer satisfaction trends
- **Escalation Tracking**: When and why conversations escalate
- **Response Quality**: Accuracy and relevance of AI responses

## Next Steps

1. **Add Knowledge Sources**: Enhance your agent with domain-specific knowledge
2. **Configure Business Catalogs**: Set up services, products, menus for transactional operations
3. **Enable Multi-Channel**: Deploy the same agent across web, phone, SMS, and email
4. **Implement Advanced Features**: Translation, voice processing, real-time analytics

## Support

- **Documentation**: [https://docs.wiil.io](https://docs.wiil.io)
- **API Reference**: [https://docs.wiil.io/developer/api-reference](https://docs.wiil.io/developer/api-reference)
- **Console**: [https://console.wiil.io](https://console.wiil.io)
- **Email**: [dev-support@wiil.io](mailto:dev-support@wiil.io)

## Contributing

Found an issue or want to add a new example? Please submit a pull request or open an issue on GitHub.

---

Built with ❤️ by the WIIL team
