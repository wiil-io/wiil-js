# Instruction Configuration Guide

This guide covers creating and managing instruction configurations using the WIIL Platform JS SDK. Instruction configurations define the prompts, behavioral guidelines, and conversation flow for AI agents.

## Quick Start

```typescript
import { WiilClient, BusinessSupportServices } from 'wiil-js';

const client = new WiilClient({
  apiKey: 'your-api-key',
});

// Create an instruction configuration
const instruction = await client.instructionConfigs.create({
  instructionName: 'Customer Support Instructions',
  role: 'Customer Support Specialist',
  introductionMessage: 'Hello! How can I help you today?',
  instructions: 'You are a helpful customer support agent. Focus on resolving customer issues efficiently.',
  guardrails: 'Always be polite and professional. Never share sensitive customer data.',
  supportedServices: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
});

console.log('Instruction created:', instruction.id);
```

## Architecture Overview

Instruction configurations are the **heart of agent behavior** in the WIIL platform:

- **Central Role**: Defines how agents operate during conversations
- **1:N Relationship**: One instruction configuration can govern multiple Agent Configurations
- **Reusability**: Designed to be reused across multiple deployments

**Example**: A "Customer Service Guidelines" instruction set might govern both a "Sales Agent" and a "Support Agent", ensuring uniform tone and compliance.

## Enums

### BusinessSupportServices

```typescript
enum BusinessSupportServices {
  APPOINTMENT_MANAGEMENT = 'appointment-management',
  PRODUCT_ORDER_MANAGEMENT = 'product-order-management',
  MENU_ORDER_MANAGEMENT = 'menu-order-management',
  RESERVATION_MANAGEMENT = 'reservation-management',
  PROPERTY_LISTING_MANAGEMENT = 'property-listing-management'
}
```

## Instruction Configuration Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| instructionName | string | Yes | System-readable name (e.g., 'customer-support-agent') |
| role | string | Yes | Role the agent adopts (e.g., 'Customer Support Specialist') |
| introductionMessage | string | Yes | Initial greeting message |
| instructions | string | Yes | Detailed behavioral guidelines and conversation flow |
| guardrails | string | Yes | Safety constraints and ethical guidelines |
| supportedServices | BusinessSupportServices[] | No | Platform business services (tools) enabled |
| knowledgeSourceIds | string[] | No | IDs of linked knowledge sources |
| requiredSkills | string[] | No | Skills required (e.g., 'appointment_booking') |
| validationRules | object | No | Custom validation rules |
| isTemplate | boolean | No | Whether this is a reusable template (default: false) |
| isPrimary | boolean | No | Whether this is the primary template (default: false) |
| metadata | object | No | Custom metadata |

## CRUD Operations

### Create Instruction Configuration

```typescript
const instruction = await client.instructionConfigs.create({
  instructionName: 'Sales Agent Instructions',
  role: 'Sales Representative',
  introductionMessage: 'Hello! I can help you find the perfect solution for your needs.',
  instructions: 'You are a knowledgeable and helpful sales agent. Focus on understanding customer needs and recommending appropriate solutions.',
  guardrails: 'Always be honest about product capabilities. Never make promises the product cannot deliver. Respect customer privacy.',
  supportedServices: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
  metadata: { department: 'sales', version: '1.0' },
});

console.log('Created instruction:', instruction.id);
console.log('Instruction name:', instruction.instructionName);
```

### Get Instruction Configuration

```typescript
const instruction = await client.instructionConfigs.get('instr_123');

console.log('Instruction name:', instruction.instructionName);
console.log('Role:', instruction.role);
console.log('Introduction:', instruction.introductionMessage);
```

### List Instruction Configurations

```typescript
const result = await client.instructionConfigs.list({
  page: 1,
  pageSize: 20,
});

console.log('Total instructions:', result.meta.totalCount);
result.data.forEach(instruction => {
  console.log(`- ${instruction.instructionName} (${instruction.id})`);
});
```

### Update Instruction Configuration

```typescript
const updated = await client.instructionConfigs.update({
  id: 'instr_123',
  introductionMessage: 'Hi! How may I assist you today?',
  guardrails: 'Updated: Always be honest and transparent. Respect privacy and confidentiality.',
});

console.log('Updated introduction:', updated.introductionMessage);
```

### Delete Instruction Configuration

```typescript
const deleted = await client.instructionConfigs.delete('instr_123');

if (deleted) {
  console.log('Instruction deleted successfully');
}
```

### Get Supported Templates

```typescript
const templates = await client.instructionConfigs.getSupportedTemplates();

console.log('Available templates:', templates.length);
templates.forEach(template => {
  console.log(`- ${template.instructionName}: ${template.role}`);
});
```

## Complete Example

Full workflow demonstrating instruction configuration lifecycle:

```typescript
import { WiilClient, BusinessSupportServices } from 'wiil-js';

const client = new WiilClient({
  apiKey: process.env.WIIL_API_KEY!,
});

async function manageInstructionConfigurations() {
  // 1. Create instruction configuration
  const instruction = await client.instructionConfigs.create({
    instructionName: 'Technical Support Instructions',
    role: 'Technical Support Specialist',
    introductionMessage: 'Hello! I am your technical support specialist. How can I help you today?',
    instructions: `You are a knowledgeable technical support agent.
    - Listen carefully to understand the issue
    - Ask clarifying questions when needed
    - Provide step-by-step solutions
    - Escalate complex issues appropriately`,
    guardrails: `Safety guidelines:
    - Never ask for passwords or sensitive credentials
    - Do not make changes without customer confirmation
    - Escalate security-related issues immediately
    - Follow data protection regulations`,
    supportedServices: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
    metadata: { department: 'technical-support', tier: 'L1' },
  });

  console.log('Instruction created:', instruction.id);

  // 2. Retrieve instruction by ID
  const retrieved = await client.instructionConfigs.get(instruction.id);
  console.log('Retrieved instruction:', retrieved.instructionName);

  // 3. List all instructions
  const allInstructions = await client.instructionConfigs.list({ page: 1, pageSize: 50 });
  console.log('Total instructions:', allInstructions.meta.totalCount);

  // 4. Update instruction configuration
  const updated = await client.instructionConfigs.update({
    id: instruction.id,
    introductionMessage: 'Welcome to technical support! How can I assist you?',
    metadata: { department: 'technical-support', tier: 'L1', updated: true },
  });

  console.log('Updated introduction:', updated.introductionMessage);

  // 5. Use instruction with an agent configuration
  const model = await client.supportModels.getDefaultMultiMode();

  const agent = await client.agentConfigs.create({
    name: 'TechSupportBot',
    modelId: model!.modelId,
    instructionConfigurationId: instruction.id,
  });

  console.log('Agent created with instruction:', agent.id);

  // 6. Clean up
  await client.agentConfigs.delete(agent.id);
  console.log('Agent deleted');

  await client.instructionConfigs.delete(instruction.id);
  console.log('Instruction deleted');
}

manageInstructionConfigurations().catch(console.error);
```

## Best Practices

1. **Write clear, detailed instructions** - The instructions field is the core of agent behavior. Be specific about how the agent should respond, what tone to use, and how to handle different scenarios.

2. **Define comprehensive guardrails** - Guardrails protect your business and customers. Include compliance rules, forbidden topics, escalation criteria, and ethical guidelines.

3. **Use supportedServices wisely** - Only enable the business services (tools) that the agent needs. This follows the principle of least privilege.

4. **Keep instruction names descriptive** - Use kebab-case names that clearly describe the purpose (e.g., 'customer-support-sales', 'technical-support-l1').

5. **Version your configurations** - Use metadata to track versions. This helps with rollbacks and auditing.

6. **Reuse instruction configurations** - Design instruction sets to be reusable across multiple agents when they share common behavioral requirements.

## Troubleshooting

### Missing Required Fields

**Error:**
```
WiilValidationError: instructionName is required
```

**Solution:**
Ensure all required fields are provided:

```typescript
const instruction = await client.instructionConfigs.create({
  instructionName: 'My Instructions',     // Required
  role: 'Assistant',                       // Required
  introductionMessage: 'Hello!',           // Required
  instructions: 'Be helpful.',             // Required
  guardrails: 'Be safe.',                  // Required
});
```

### Instruction Not Found

**Error:**
```
WiilAPIError: Instruction configuration not found
```

**Solution:**
Verify the instruction ID exists before using it:

```typescript
try {
  const instruction = await client.instructionConfigs.get('instr_123');
  // Use instruction
} catch (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('Instruction does not exist');
  }
}
```

### Cannot Delete Instruction in Use

**Error:**
```
WiilAPIError: Cannot delete instruction configuration that is referenced by agent configurations
```

**Solution:**
Delete or update agent configurations that reference this instruction first:

```typescript
// First, list agents using this instruction
const agents = await client.agentConfigs.list();
const usingInstruction = agents.data.filter(
  a => a.instructionConfigurationId === 'instr_123'
);

// Delete or update those agents
for (const agent of usingInstruction) {
  await client.agentConfigs.delete(agent.id);
}

// Now delete the instruction
await client.instructionConfigs.delete('instr_123');
```
