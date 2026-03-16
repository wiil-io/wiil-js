# Agent Configuration Guide

This guide covers creating and managing AI agent configurations using the WIIL Platform JS SDK. Agent configurations define the model, behavior, and capabilities of AI assistants deployed across various channels.

## Quick Start

```typescript
import { WiilClient, LLMType, AssistantType, BusinessSupportServices } from 'wiil-js';

const client = new WiilClient({
  apiKey: 'your-api-key',
});

// Get a valid modelId from the support models registry
const model = await client.supportModels.getDefaultMultiMode();

// First, create an instruction configuration
const instruction = await client.instructionConfigs.create({
  instructionName: 'Customer Support Instructions',
  role: 'Customer Support Agent',
  introductionMessage: 'Hello! How can I help you today?',
  instructions: 'You are a helpful customer support agent.',
  guardrails: 'Always be polite and professional.',
  supportedServices: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
});

// Create an agent configuration
const agent = await client.agentConfigs.create({
  name: 'Harper',
  modelId: model.modelId,
  instructionConfigurationId: instruction.id,
  defaultFunctionState: LLMType.MULTI_MODE,
  assistantType: AssistantType.GENERAL,
});

console.log('Agent created:', agent.id);
```

## Prerequisites

Agent configurations require an **Instruction Configuration** to be created first. The instruction configuration defines the agent's role, behavior guidelines, and conversation flow.

```typescript
// Get a valid modelId from the support models registry
const model = await client.supportModels.getDefaultMultiMode();

// First, create an instruction configuration
const instruction = await client.instructionConfigs.create({
  instructionName: 'Customer Support Instructions',
  role: 'Customer Support Agent',
  introductionMessage: 'Hello! How can I help you today?',
  instructions: 'You are a helpful customer support agent.',
  guardrails: 'Always be polite and professional.',
  supportedServices: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
});

// Then create the agent configuration
const agent = await client.agentConfigs.create({
  name: 'Harper',
  modelId: model.modelId,
  instructionConfigurationId: instruction.id,
});
```

## Enums

### LLMType

```typescript
enum LLMType {
  STS = 'sts',              // Speech-to-speech
  TTS = 'tts',              // Text-to-speech
  STT = 'stt',              // Speech-to-text
  TRANSCRIBE = 'transcribe', // Transcription
  TEXT_PROCESSING = 'text',  // Text processing only
  MULTI_MODE = 'multi_mode'  // Multi-modal (default)
}
```

### AssistantType

```typescript
enum AssistantType {
  PHONE = 'phone',    // Phone-based assistant
  WEB = 'web',        // Web chat assistant
  EMAIL = 'email',    // Email assistant
  GENERAL = 'general' // General purpose (default)
}
```

## Agent Configuration Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Agent name (max 30 characters) |
| modelId | string | Yes | LLM model ID from Wiil model registry |
| instructionConfigurationId | string | Yes | ID of linked instruction configuration |
| defaultFunctionState | LLMType | No | Operational mode (default: MULTI_MODE) |
| assistantType | AssistantType | No | Channel specialization (default: GENERAL) |
| usesWiilSupportModel | boolean | No | Use Wiil's model registry (default: true) |
| requiredModelConfig | object | No | Additional model parameters |
| call_transfer_config | CallTransferConfig[] | No | Phone transfer configurations |
| metadata | object | No | Custom metadata |

### CallTransferConfig Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| transfer_number | string | Yes | Phone number to transfer to |
| transfer_type | string | No | 'blind' or 'warm' (default: 'warm') |
| transfer_conditions | string[] | Yes | Conditions that trigger transfer |

## CRUD Operations

### Create Agent Configuration

```typescript
// Get a valid modelId from the support models registry
const model = await client.supportModels.getDefaultMultiMode();

// Create instruction configuration first (see Prerequisites section)
const instruction = await client.instructionConfigs.create({
  instructionName: 'Support Agent Instructions',
  role: 'Support Agent',
  introductionMessage: 'Hello!',
  instructions: 'You are a helpful support agent.',
  guardrails: 'Be professional.',
  supportedServices: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
});

const agent = await client.agentConfigs.create({
  name: 'Harper',
  modelId: model.modelId,
  instructionConfigurationId: instruction.id,
  defaultFunctionState: LLMType.MULTI_MODE,
  assistantType: AssistantType.GENERAL,
  metadata: { department: 'support', tier: 'premium' },
});

console.log('Created agent:', agent.id);
console.log('Agent name:', agent.name);
```

### Get Agent Configuration

```typescript
const agent = await client.agentConfigs.get('agent_123');

console.log('Agent name:', agent.name);
console.log('Model ID:', agent.modelId);
console.log('Assistant type:', agent.assistantType);
```

### List Agent Configurations

```typescript
const result = await client.agentConfigs.list({
  page: 1,
  pageSize: 20,
});

console.log('Total agents:', result.meta.totalCount);
result.data.forEach(agent => {
  console.log(`- ${agent.name} (${agent.id})`);
});
```

### Update Agent Configuration

```typescript
const updated = await client.agentConfigs.update({
  id: 'agent_123',
  name: 'Riley',
  metadata: { department: 'sales', updated: true },
});

console.log('Updated name:', updated.name);
```

### Delete Agent Configuration

```typescript
const deleted = await client.agentConfigs.delete('agent_123');

if (deleted) {
  console.log('Agent deleted successfully');
}
```

## Phone Agent with Call Transfer

Configure call transfer for phone-based agents:

```typescript
// Get a valid modelId from the support models registry
const model = await client.supportModels.getDefaultMultiMode();

// Create phone support instruction configuration first
const phoneInstruction = await client.instructionConfigs.create({
  instructionName: 'Phone Support Instructions',
  role: 'Phone Support Agent',
  introductionMessage: 'Thank you for calling. How can I assist you?',
  instructions: 'You are a phone support agent. Be concise and helpful.',
  guardrails: 'Transfer to human when requested or for complex issues.',
  supportedServices: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
});

const phoneAgent = await client.agentConfigs.create({
  name: 'PhoneSupport',
  modelId: model.modelId,
  instructionConfigurationId: phoneInstruction.id,
  assistantType: AssistantType.PHONE,
  call_transfer_config: [
    {
      transfer_number: '+15551234567',
      transfer_type: 'warm',
      transfer_conditions: [
        'Customer requests human agent',
        'Issue requires supervisor approval',
        'Technical problem beyond AI capability',
      ],
    },
    {
      transfer_number: '+15559876543',
      transfer_type: 'blind',
      transfer_conditions: [
        'Billing dispute over $500',
        'Legal inquiry',
      ],
    },
  ],
});
```

## Complete Example

Full workflow demonstrating agent configuration lifecycle:

```typescript
import { WiilClient, LLMType, AssistantType, BusinessSupportServices } from 'wiil-js';

const client = new WiilClient({
  apiKey: process.env.WIIL_API_KEY!,
});

async function manageAgentConfigurations() {
  // 1. Get a valid modelId from the support models registry
  const model = await client.supportModels.getDefaultMultiMode();
  console.log('Using model:', model.modelId);

  // 2. Create instruction configuration first
  const instruction = await client.instructionConfigs.create({
    instructionName: 'Sales Agent Instructions',
    role: 'Sales Representative',
    introductionMessage: 'Hi! I can help you find the perfect product.',
    instructions: 'You are a knowledgeable sales assistant. Help customers find products that match their needs.',
    guardrails: 'Never pressure customers. Be honest about product limitations.',
    supportedServices: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
  });

  console.log('Instruction created:', instruction.id);

  // 3. Create agent configuration
  const agent = await client.agentConfigs.create({
    name: 'SalesBot',
    modelId: model.modelId,
    instructionConfigurationId: instruction.id,
    defaultFunctionState: LLMType.MULTI_MODE,
    assistantType: AssistantType.WEB,
    metadata: { department: 'sales', version: '1.0' },
  });

  console.log('Agent created:', agent.id);

  // 4. Retrieve agent by ID
  const retrieved = await client.agentConfigs.get(agent.id);
  console.log('Retrieved agent:', retrieved.name);

  // 5. List all agents
  const allAgents = await client.agentConfigs.list({ page: 1, pageSize: 50 });
  console.log('Total agents:', allAgents.meta.totalCount);

  // 6. Update agent configuration
  const updated = await client.agentConfigs.update({
    id: agent.id,
    name: 'SalesAssistant',
    metadata: { department: 'sales', version: '1.1', updated: true },
  });

  console.log('Updated agent name:', updated.name);

  // 7. Clean up - delete agent and instruction
  await client.agentConfigs.delete(agent.id);
  console.log('Agent deleted');

  await client.instructionConfigs.delete(instruction.id);
  console.log('Instruction deleted');
}

manageAgentConfigurations().catch(console.error);
```

## Best Practices

1. **Create instruction configurations first** - Agent configurations require an instruction configuration ID. Always create the instruction before the agent.

2. **Use meaningful agent names** - Names are limited to 30 characters. Choose descriptive names that indicate the agent's purpose.

3. **Match assistantType to deployment** - Set the appropriate assistant type for your deployment channel:
   - `PHONE` for voice-based interactions
   - `WEB` for chat widgets
   - `EMAIL` for email automation
   - `GENERAL` for multi-channel or API-only use

4. **Configure call transfers for phone agents** - When deploying phone agents, set up appropriate transfer conditions to route complex issues to human agents.

5. **Use metadata for organization** - Store department, version, and other organizational data in the metadata field.

## Troubleshooting

### Missing instructionConfigurationId

**Error:**
```
WiilValidationError: instructionConfigurationId is required
```

**Solution:**
Create an instruction configuration first and pass its ID:

```typescript
// Get a valid modelId from the support models registry
const model = await client.supportModels.getDefaultMultiMode();

const instruction = await client.instructionConfigs.create({
  instructionName: 'My Instructions',
  role: 'Assistant',
  instructions: 'Be helpful.',
  supportedServices: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
});

const agent = await client.agentConfigs.create({
  name: 'MyAgent',
  modelId: model.modelId,
  instructionConfigurationId: instruction.id, // Required
});
```

### Invalid modelId

**Error:**
```
WiilAPIError: Model not found in registry
```

**Solution:**
Use a valid model ID from the Wiil support models registry:

```typescript
// Option 1: Get the default multi-mode model
const model = await client.supportModels.getDefaultMultiMode();
console.log('Model ID:', model.modelId);

// Option 2: List all available models
const models = await client.supportModels.list();
models.forEach(model => {
  console.log(`${model.modelId}: ${model.name}`);
});
```

### Name Too Long

**Error:**
```
WiilValidationError: name must be at most 30 characters
```

**Solution:**
Keep agent names concise (30 characters or less):

```typescript
// Bad
const agent = await client.agentConfigs.create({
  name: 'Super Advanced Customer Support AI Assistant v2',  // Too long!
  // ...
});

// Good
const agent = await client.agentConfigs.create({
  name: 'CustomerSupportAI',  // 17 characters
  // ...
});
```
