# Fundamental Configuration Setup

**Complete guide from signup to deploying your first AI agent**

This guide walks you through the complete, chronological steps to set up and configure an AI agent in a service channel on the WIIL Platform - from account creation to deployment.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Step 1: Initialize Client & Verify Organization](#step-1-initialize-client--verify-organization)
4. [Step 2: Create or Select Project](#step-2-create-or-select-project)
5. [Step 3: Create Instruction Configuration](#step-3-create-instruction-configuration)
6. [Step 4: Get Wiil Support Models](#step-4-get-wiil-support-models)
7. [Step 5: Create Agent Configuration](#step-5-create-agent-configuration)
8. [Step 6: Create Deployment Channel](#step-6-create-deployment-channel)
9. [Step 7: Create Deployment Configuration](#step-7-create-deployment-configuration)
10. [Step 8: Deploy Agent](#step-8-deploy-agent)
11. [Step 9: Verify Deployment](#step-9-verify-deployment)
12. [Next Steps](#next-steps)

---

## Prerequisites

Before you begin, ensure you have:

1. **WIIL Platform Account**
   - Sign up at [https://console.wiil.io](https://console.wiil.io)
   - Complete email verification

2. **API Key**
   - Navigate to **Settings** → **API Keys** in the WIIL Console
   - Click **Generate New API Key**
   - Copy and securely store your API key

3. **Development Environment**
   - Node.js 16.x or higher
   - npm or yarn package manager
   - Text editor or IDE

4. **SDK Installation**
   ```bash
   npm install wiil-js
   # or
   yarn add wiil-js
   ```

---

## Environment Setup

### 1. Create Project Directory

```bash
mkdir my-wiil-agent
cd my-wiil-agent
npm init -y
npm install wiil-js
```

### 2. Configure Environment Variables

Create a `.env` file in your project root:

```env
WIIL_API_KEY=your-api-key-here
```

**Security Note**: Never commit your `.env` file to version control. Add it to `.gitignore`:

```bash
echo ".env" >> .gitignore
```

### 3. Create Your Setup Script

Create a new file `setup.ts` (or `setup.js` for JavaScript):

```typescript
import { WiilClient } from 'wiil-js';

// Initialize client
const client = new WiilClient({
  apiKey: process.env.WIIL_API_KEY!
});

async function main() {
  // Your setup code will go here
}

main().catch(console.error);
```

---

## Step 1: Initialize Client & Verify Organization

**Objective**: Connect to the WIIL Platform and verify your organization details.

### Code

```typescript
import { WiilClient } from 'wiil-js';

const client = new WiilClient({
  apiKey: process.env.WIIL_API_KEY!
});

// Verify your organization
const organization = await client.organizations.get();

console.log('Organization Details:');
console.log(`  Company Name: ${organization.companyName}`);
console.log(`  Organization ID: ${organization.id}`);
console.log(`  Service Status: ${organization.serviceStatus}`);
console.log(`  Business Vertical: ${organization.businessVerticalId}`);
```

### Expected Output

```
Organization Details:
  Company Name: ACME Corporation
  Organization ID: 1a2b3c4d5e
  Service Status: ACTIVE
  Business Vertical: RETAIL
```

### What This Does

- Validates your API key
- Confirms your organization is active
- Retrieves your organization ID (needed for subsequent steps)

---

## Step 2: Create or Select Project

**Objective**: Set up a project for organizing your configurations.

### Understanding Projects

Projects help you organize deployments by business unit (Sales, Support, Operations) or use case.

### Code

```typescript
// Option A: Use the existing default project (created by the system)
let project;
try {
  project = await client.projects.getDefault();
  console.log(`Using default project: ${project.name}`);
} catch (error) {
  // Option B: Create a new project (if no default exists)
  project = await client.projects.create({
    name: 'Customer Support',
    description: 'Customer support AI agent deployments'
  });
  console.log(`Created new project: ${project.name}`);
}

console.log(`Project ID: ${project.id}`);
```

### Expected Output

```
Created new project: Customer Support
Project ID: 9x8y7z6w5v
```

---

## Step 3: Create Instruction Configuration

**Objective**: Define how your agent behaves, communicates, and handles conversations.

### Understanding Instruction Configuration

This is the **heart of your agent's behavior**. It includes:

- **Role**: The agent's persona and responsibilities
- **Introduction Message**: Initial greeting presented to customers
- **Instructions**: Detailed behavioral guidelines and conversation flow
- **Guardrails**: Safety constraints, compliance rules, and ethical boundaries

**Note**: The instruction configuration must be created first because the agent configuration requires an `instructionConfigurationId`.

### Code

```typescript
const instructionConfig = await client.instructionConfigs.create({
  // ========================================================================
  // INSTRUCTION NAME - System-readable identifier
  // ========================================================================
  instructionName: 'customer-support-agent',

  // ========================================================================
  // ROLE - The agent's persona
  // ========================================================================
  role: 'Customer Support Specialist',

  // ========================================================================
  // INTRODUCTION MESSAGE - Initial greeting
  // ========================================================================
  introductionMessage: `Hello! I'm an AI assistant from ACME Corporation. How can I help you today?`,

  // ========================================================================
  // INSTRUCTIONS - Detailed behavioral guidelines
  // ========================================================================
  instructions: `You are a professional customer support agent for ACME Corporation, a leading provider of business solutions.

Your role and responsibilities:
- Greet customers warmly and professionally
- Answer questions about products, services, and orders
- Help customers book appointments and make reservations
- Provide accurate, clear, and concise information
- Resolve issues efficiently and empathetically
- Escalate complex issues to human agents when appropriate

Your communication style:
- Professional yet friendly and approachable
- Clear and concise - avoid jargon
- Patient and empathetic
- Proactive in offering solutions
- Respectful of customer time

Conversation guidelines:
1. Opening: Start with a warm greeting, identify yourself, address customer by name if available
2. Engagement: Ask clarifying questions, listen actively, acknowledge concerns
3. Problem Solving: Offer specific solutions, confirm understanding, set clear expectations
4. Bookings & Transactions: Confirm all details (date, time, service, customer info), provide confirmation numbers
5. Closing: Summarize resolution, ask if anything else is needed, thank the customer

Your knowledge:
- Product catalog and pricing
- Service offerings and availability
- Company policies and procedures
- Booking and reservation systems
- Order tracking and status

Remember: You represent ACME Corporation. Always maintain professionalism while being genuinely helpful.`,

  // ========================================================================
  // GUARDRAILS - Safety and compliance constraints
  // ========================================================================
  guardrails: `Data Privacy:
- NEVER share or request sensitive personal information (SSN, passwords, full credit card numbers)
- Follow GDPR and data privacy regulations
- Do not access or reference customer data unless necessary for the current request

Professional Boundaries:
- Do not make medical diagnoses or provide medical advice
- Do not provide legal advice or interpretations
- Do not make financial recommendations or guarantees
- Do not make commitments beyond standard company policies

Ethical Guidelines:
- Be honest if you don't know something - don't make up information
- Admit limitations and escalate when appropriate
- Treat all customers with equal respect and priority
- Do not engage in discriminatory language or behavior

Brand Protection:
- Do not speak negatively about competitors
- Do not share confidential company information
- Follow brand voice and messaging guidelines

Escalation Triggers:
- Customer requests to speak with a human more than once
- Keywords: complaint, refund, manager, supervisor, legal, lawyer, lawsuit, discrimination, harassment
- Issue requires access to systems the agent cannot use
- Customer is experiencing an emergency or urgent situation
- Conversation exceeds 10 minutes without resolution
- Customer is dissatisfied with the agent's responses`
});

console.log(`Instructions Created: ${instructionConfig.instructionName}`);
console.log(`Instructions ID: ${instructionConfig.id}`);
```

### Expected Output

```
Instructions Created: customer-support-agent
Instructions ID: f6g7h8i9j0
```

### Tips for Writing Effective Instructions

1. **Be Specific**: Vague instructions lead to inconsistent behavior
2. **Use Examples**: Show the agent what good responses look like
3. **Set Boundaries**: Clearly define what the agent should NOT do
4. **Plan for Edge Cases**: Account for unusual customer requests
5. **Iterate**: Start simple, then refine based on real conversations

---

## Step 4: Get Wiil Support Models

**Objective**: Retrieve available AI models from the Wiil Support Model Registry.

### Understanding Support Models

The WIIL Platform maintains a curated registry of AI models from various providers (OpenAI, Anthropic, Google, etc.). Each model has a unique **Wiil Model ID** that you'll use when configuring agents.

The Support Model Registry includes:

- **Text Models**: GPT-4, Claude, Gemini for conversational AI
- **Voice Models**: Speech-to-Text (STT) and Text-to-Speech (TTS)
- **Multi-Mode Models**: Models supporting text, voice, and vision
- **Translation Models**: Specialized for multilingual translation

### Code

```typescript
// List all available models
const allModels = await client.supportModels.list();
console.log(`Available models: ${allModels.length}`);

// Get default multi-mode model (recommended for conversational agents)
const defaultModel = await client.supportModels.getDefaultMultiMode();
if (defaultModel) {
  console.log('Default Multi-Mode Model:');
  console.log(`  Name: ${defaultModel.name}`);
  console.log(`  Wiil Model ID: ${defaultModel.modelId}`);
  console.log(`  Proprietor: ${defaultModel.proprietor}`);
  console.log(`  Provider Model ID: ${defaultModel.provider_model_id}`);
  console.log(`  Type: ${defaultModel.type}`);
  console.log(`  Discontinued: ${defaultModel.discontinued}`);
}

// Lookup a specific model by provider details
const geminiModel = await client.supportModels.getByProprietorAndProviderModelId(
  'Google',
  'gemini-2.0-flash-exp'
);
if (geminiModel) {
  console.log(`Gemini Wiil Model ID: ${geminiModel.modelId}`);
}
```

### Expected Output

```
Available models: 47
Default Multi-Mode Model:
  Name: Gemini 2.0 Flash (Experimental)
  Wiil Model ID: abc123xyz
  Proprietor: Google
  Provider Model ID: gemini-2.0-flash-exp
  Type: MULTI_MODE
  Discontinued: false
Gemini Wiil Model ID: abc123xyz
```

### Available Default Models

| Method | Purpose | Returns |
|--------|---------|---------|
| `getDefaultMultiMode()` | General conversational AI | Best multi-mode model (text, voice, vision) |
| `getDefaultTTS()` | Text-to-Speech | Best TTS model for voice synthesis |
| `getDefaultSTT()` | Speech-to-Text | Best STT model for transcription |
| `getDefaultSTS()` | Speech-to-Speech | Best model for direct voice-to-voice |
| `getDefaultTranscribe()` | Transcription | Best model for audio transcription |
| `getDefaultBatch()` | Batch processing | Best model for bulk operations |
| `getDefaultTranslationSTT()` | Translation STT | Best STT for translation workflows |
| `getDefaultTranslationTTS()` | Translation TTS | Best TTS for translation workflows |

---

## Step 5: Create Agent Configuration

**Objective**: Define your AI agent by linking the instruction configuration with an AI model.

### Understanding Agent Configuration

The Agent Configuration links together:

- **Instruction Configuration**: Behavioral guidelines (from Step 3)
- **AI Model**: Language model from Support Model Registry (from Step 4)
- **Assistant Type**: Channel specialization (GENERAL, WEB, PHONE, EMAIL)

### Code

```typescript
// Verify we have the required dependencies from previous steps
if (!defaultModel) {
  throw new Error('No default multi-mode model available');
}

// Create agent configuration
const agentConfig = await client.agentConfigs.create({
  name: 'Customer Support Agent',
  modelId: defaultModel.modelId,  // Wiil Model ID from Step 4
  instructionConfigurationId: instructionConfig.id  // From Step 3
});

console.log(`Agent Created: ${agentConfig.name}`);
console.log(`Agent ID: ${agentConfig.id}`);
console.log(`Using Model: ${defaultModel.name} (${defaultModel.modelId})`);
console.log(`Using Instructions: ${instructionConfig.instructionName}`);
```

### Expected Output

```
Agent Created: Customer Support Agent
Agent ID: a1b2c3d4e5
Using Model: Gemini 2.0 Flash (Experimental) (abc123xyz)
Using Instructions: customer-support-agent
```

---

## Step 6: Create Deployment Channel

**Objective**: Set up a communication channel where customers can interact with your agent.

### Understanding Deployment Channels

Channels define how customers reach your agent:

- **WEB**: Web chat widget
- **CALLS**: Phone calls (telephony)
- **SMS**: Text messaging
- **WHATSAPP**: WhatsApp messaging (Coming Soon)
- **EMAIL**: Email conversations
- **MOBILE**: Mobile app integration (Coming Soon)

**Note**: The deployment channel must be created first because the deployment configuration requires a `deploymentChannelId`.

### Code - Web Chat Channel

```typescript
const webChatChannel = await client.deploymentChannels.create({
  channelName: 'Website Live Chat',
  deploymentType: 'WEB',
  channelIdentifier: 'web-chat-widget-01',  // Unique identifier for this channel
  recordingEnabled: true,  // Enable conversation recording
  configuration: {
    communicationType: 'TEXT',  // TEXT, VOICE, or UNIFIED
    customCssUrl: null,  // Optional custom CSS for widget styling
    widgetConfiguration: {
      position: 'right',  // 'left' or 'right'
      theme: 'light',  // 'light', 'dark', or 'custom'
      customTheme: {}  // Custom theme colors (if theme is 'custom')
    }
  }
});

console.log(`Channel Created: ${webChatChannel.channelName}`);
console.log(`Channel ID: ${webChatChannel.id}`);
console.log(`Channel Type: ${webChatChannel.deploymentType}`);
```

### Expected Output

```
Channel Created: Website Live Chat
Channel ID: p6q7r8s9t0
Channel Type: WEB
```

---

## Step 7: Create Deployment Configuration

**Objective**: Link your agent, instructions, and channel into a deployable unit.

### Understanding Deployment Configuration

The Deployment Configuration:

- Links Agent Configuration, Instruction Configuration, and Deployment Channel
- Sets deployment status and activation state
- Uses provisioning type (DIRECT or CHAINED for voice processing)
- Requires a project context for organizational grouping

### Code

```typescript
const deploymentConfig = await client.deploymentConfigs.create({
  // Required fields
  projectId: project.id,                        // From Step 2
  deploymentChannelId: webChatChannel.id,      // From Step 6
  agentConfigurationId: agentConfig.id,        // From Step 5
  instructionConfigurationId: instructionConfig.id,  // From Step 3

  // Optional fields
  deploymentName: 'Customer Support Deployment',
  isActive: true,
  deploymentStatus: 'pending',  // Will be 'pending' initially
  provisioningType: 'direct'    // 'direct' or 'chained' (for voice processing)
});

console.log(`Deployment Created: ${deploymentConfig.deploymentName}`);
console.log(`Deployment ID: ${deploymentConfig.id}`);
console.log(`Status: ${deploymentConfig.deploymentStatus}`);
console.log(`Active: ${deploymentConfig.isActive}`);
```

### Expected Output

```
Deployment Created: Customer Support Deployment
Deployment ID: k1l2m3n4o5
Status: pending
Active: true
```

---

## Step 8: Deploy Agent

**Objective**: Integrate the agent into your application or website.

### For Web Chat

After creating the web chat channel, integrate it into your website:

#### HTML Integration

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
</head>
<body>
  <!-- Your website content -->
  <h1>Welcome to ACME Corporation</h1>

  <!-- WIIL Chat Widget - Add before closing </body> tag -->
  <script src="https://cdn.wiil.io/chat-widget.js"></script>
  <script>
    WiilChat.init({
      channelId: 'p6q7r8s9t0',  // Your channel ID from Step 7
      apiKey: 'pk_your_public_api_key'  // Public API key from WIIL Console
    });
  </script>
</body>
</html>
```

#### React Integration

```tsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Load WIIL Chat Widget
    const script = document.createElement('script');
    script.src = 'https://cdn.wiil.io/chat-widget.js';
    script.async = true;
    script.onload = () => {
      window.WiilChat.init({
        channelId: 'p6q7r8s9t0',
        apiKey: 'pk_your_public_api_key'
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="App">
      <h1>Welcome to ACME Corporation</h1>
      {/* Your app content */}
    </div>
  );
}
```

### For Telephony

No integration needed - customers can immediately call your configured phone number.

### For SMS

No integration needed - customers can text your configured SMS number.

---

## Step 9: Verify Deployment

**Objective**: Confirm your agent is live and functioning correctly.

### Code

```typescript
// Retrieve and verify deployment
const verifiedDeployment = await client.deploymentConfigs.get(deploymentConfig.id);
const verifiedChannel = await client.deploymentChannels.get(webChatChannel.id);

console.log('='.repeat(60));
console.log('DEPLOYMENT VERIFICATION');
console.log('='.repeat(60));

console.log('\nDeployment Status:');
console.log(`  Active: ${verifiedDeployment.isActive ? '✓ YES' : '✗ NO'}`);
console.log(`  Agent: ${verifiedDeployment.agentConfigurationId}`);
console.log(`  Instructions: ${verifiedDeployment.instructionConfigurationId}`);

console.log('\nChannel Status:');
console.log(`  Active: ${verifiedChannel.isActive ? '✓ YES' : '✗ NO'}`);
console.log(`  Type: ${verifiedChannel.channelType}`);
console.log(`  Channel ID: ${verifiedChannel.id}`);

console.log('\n' + '='.repeat(60));
console.log('✓ DEPLOYMENT COMPLETE - Agent is LIVE!');
console.log('='.repeat(60));
```

### Expected Output

```
============================================================
DEPLOYMENT VERIFICATION
============================================================

Deployment Status:
  Active: ✓ YES
  Agent: a1b2c3d4e5
  Instructions: f6g7h8i9j0

Channel Status:
  Active: ✓ YES
  Type: WEB
  Channel ID: p6q7r8s9t0

============================================================
✓ DEPLOYMENT COMPLETE - Agent is LIVE!
============================================================
```

### Testing Your Agent

1. **Visit your website** where you integrated the chat widget
2. **Start a conversation** with test queries:
   - "What are your business hours?"
   - "I need to book an appointment"
   - "Tell me about your products"
3. **Test escalation** by saying "I want to speak with a manager"
4. **Monitor in WIIL Console**:
   - Navigate to **Conversations** to see live interactions
   - View **Analytics** for performance metrics

---

## Next Steps

Congratulations! Your AI agent is now deployed and ready to handle customer conversations.

### 1. Monitor Performance

**WIIL Console → Analytics Dashboard**

Track key metrics:
- Conversation volume and trends
- Average conversation duration
- Customer satisfaction scores
- Escalation rate
- Response accuracy

### 2. Refine Instructions

Based on real conversations, update your instruction configuration:

```typescript
const updatedInstructions = await client.instructionConfigs.update({
  id: instructionConfig.id,
  systemPrompt: '... improved prompt based on learnings ...',
  version: '1.1'
});
```

### 3. Add Knowledge Sources

Enhance your agent with domain-specific knowledge:

```typescript
const knowledgeSource = await client.knowledgeSources.create({
  name: 'Product Documentation',
  description: 'Complete product catalog and specifications',
  sourceType: 'DOCUMENT',
  content: '... your product documentation ...'
});

// Link to deployment
await client.deploymentConfigs.update({
  id: deploymentConfig.id,
  knowledgeSourceIds: [knowledgeSource.id]
});
```

### 4. Enable Multi-Channel

Deploy the same agent across multiple channels:

```typescript
// Add SMS channel
const smsChannel = await client.deploymentChannels.create({
  name: 'SMS Support',
  channelType: 'SMS',
  deploymentConfigId: deploymentConfig.id,
  // ... SMS configuration
});

// Add phone channel
const phoneChannel = await client.deploymentChannels.create({
  name: 'Phone Support',
  channelType: 'TELEPHONY',
  deploymentConfigId: deploymentConfig.id,
  // ... phone configuration
});
```

### 5. Configure Business Catalogs

Enable transactional operations (appointments, orders):

```typescript
// Create a business service
const service = await client.businessServices.create({
  name: 'Consultation',
  description: '30-minute business consultation',
  duration: 30,
  price: 100.00
});

// Agent can now book appointments for this service!
```

### 6. Set Up Escalation Workflow

Configure human handoff:

```typescript
await client.deploymentConfigs.update({
  id: deploymentConfig.id,
  escalationConfig: {
    enabled: true,
    humanAgentQueue: 'support-tier-1',
    notifyVia: ['email', 'slack'],
    notificationEmail: 'support@acme.com',
    slackWebhook: 'https://hooks.slack.com/...'
  }
});
```

### 7. Implement A/B Testing

Test different instruction sets:

```typescript
// Create variant instructions
const instructionsV2 = await client.instructionConfigs.create({
  name: 'Customer Support Instructions v2.0',
  systemPrompt: '... alternative approach ...'
});

// Create test deployment (10% traffic)
const testDeployment = await client.deploymentConfigs.create({
  name: 'A/B Test - Instructions v2',
  agentConfigId: agentConfig.id,
  instructionConfigId: instructionsV2.id,
  trafficAllocation: 0.1  // 10% of conversations
});
```

---

## Complete Setup Script

Here's the complete script combining all steps:

```typescript
import { WiilClient } from 'wiil-js';

async function setupWiilAgent() {
  // Initialize
  const client = new WiilClient({ apiKey: process.env.WIIL_API_KEY! });

  // Step 1: Verify organization
  const org = await client.organizations.get();
  console.log(`Organization: ${org.companyName}`);

  // Step 2: Create project
  const project = await client.projects.create({
    name: 'Customer Support',
    description: 'Customer support deployments'
  });

  // Step 3: Create instruction config (required for agent)
  const instructions = await client.instructionConfigs.create({
    instructionName: 'support-agent',
    role: 'Customer Support Specialist',
    introductionMessage: 'Hello! How can I help you today?',
    instructions: 'You are a helpful customer support agent for ACME Corporation...',
    guardrails: 'Never share sensitive customer information...'
  });

  // Step 4: Get support models
  const defaultModel = await client.supportModels.getDefaultMultiMode();
  const defaultTTS = await client.supportModels.getDefaultTTS();
  const defaultSTT = await client.supportModels.getDefaultSTT();

  if (!defaultModel) {
    throw new Error('No default multi-mode model available');
  }

  console.log(`Using Model: ${defaultModel.name} (${defaultModel.modelId})`);

  // Step 5: Create agent config
  const agent = await client.agentConfigs.create({
    name: 'Support Agent',
    modelId: defaultModel.modelId,
    instructionConfigurationId: instructions.id
  });

  // Step 6: Create deployment channel
  const channel = await client.deploymentChannels.create({
    channelName: 'Web Chat',
    deploymentType: 'WEB',
    channelIdentifier: 'web-chat-01',
    recordingEnabled: true,
    configuration: {
      communicationType: 'TEXT',
      customCssUrl: null,
      widgetConfiguration: {
        position: 'right',
        theme: 'light',
        customTheme: {}
      }
    }
  });

  // Step 7: Create deployment configuration
  const deployment = await client.deploymentConfigs.create({
    projectId: project.id,
    deploymentChannelId: channel.id,
    agentConfigurationId: agent.id,
    instructionConfigurationId: instructions.id,
    deploymentName: 'Customer Support Deployment',
    isActive: true,
    deploymentStatus: 'pending',
    provisioningType: 'direct'
  });

  console.log('✓ Setup complete!');
  console.log(`Channel ID: ${channel.id}`);
}

setupWiilAgent().catch(console.error);
```

---

## Troubleshooting

### Issue: "Invalid API Key"

**Solution**: Verify your API key in `.env` file and WIIL Console.

```typescript
// Test API key
try {
  const org = await client.organizations.get();
  console.log('✓ API key is valid');
} catch (error) {
  console.error('✗ Invalid API key:', error.message);
}
```

### Issue: "Channel not appearing on website"

**Solutions**:
1. Verify channel is active: `channel.isActive === true`
2. Check channel ID in integration code
3. Ensure script loads: Check browser console for errors
4. Clear browser cache

### Issue: "Agent not responding"

**Solutions**:
1. Verify deployment is active: `deployment.isActive === true`
2. Check agent model is valid
3. Review instruction configuration for errors
4. Check WIIL Console for error logs

### Issue: "Conversations immediately escalate"

**Solution**: Review escalation triggers in the guardrails section - may be too sensitive. Update the instruction configuration's guardrails to adjust escalation keywords and conditions.

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

### Community
- **Discord**: Join our developer community
- **Blog**: Technical articles and best practices
- **Changelog**: Stay updated with new features

---

**Congratulations!** You've successfully deployed your first AI agent on the WIIL Platform. 🎉

Your agent is now handling customer conversations 24/7, helping your business scale customer support while maintaining quality interactions.

---

*Built with ❤️ by the WIIL team*
