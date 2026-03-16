# Knowledge Sources Guide

This guide covers accessing knowledge sources using the WIIL Platform JS SDK. Knowledge sources represent repositories of information that AI agents can access for context and factual grounding.

## Quick Start

```typescript
import { WiilClient } from 'wiil-js';

const client = new WiilClient({
  apiKey: 'your-api-key',
});

// List knowledge sources
const result = await client.knowledgeSources.list();

console.log('Total sources:', result.meta.totalCount);
result.data.forEach(source => {
  console.log(`- ${source.name} (${source.type})`);
});
```

## Architecture Overview

Knowledge sources are a **read-only resource** that provides:

- **Information Repositories**: Documents, FAQs, product catalogs, and other data
- **Agent Context**: Factual grounding for AI agent responses
- **Referenced by Instructions**: Instruction configurations link to knowledge sources via `knowledgeSourceIds`

**Relationship with Instruction Configurations:**
```typescript
const instruction = await client.instructionConfigs.create({
  // ... other fields
  knowledgeSourceIds: ['ks_123', 'ks_456'],  // Link to knowledge sources
});
```

## Operations

### List Knowledge Sources

```typescript
// List with default pagination
const result = await client.knowledgeSources.list();

console.log('Total knowledge sources:', result.meta.totalCount);
console.log('Page:', result.meta.page, 'of', result.meta.totalPages);

result.data.forEach(source => {
  console.log(`${source.name}:`);
  console.log(`  ID: ${source.id}`);
  console.log(`  Type: ${source.type}`);
});
```

### List with Custom Pagination

```typescript
const result = await client.knowledgeSources.list({
  page: 2,
  pageSize: 50,
});

console.log(`Page ${result.meta.page} of ${result.meta.totalPages}`);
console.log(`Showing ${result.data.length} of ${result.meta.totalCount} sources`);
```

### Get Knowledge Source by ID

```typescript
const source = await client.knowledgeSources.get('ks_123');

console.log('Knowledge Source:');
console.log('  ID:', source.id);
console.log('  Name:', source.name);
console.log('  Type:', source.type);
console.log('  Created:', new Date(source.createdAt).toISOString());
```

## Using Knowledge Sources with Instructions

Knowledge sources provide context for AI agents through instruction configurations:

```typescript
// 1. List available knowledge sources
const sources = await client.knowledgeSources.list();

console.log('Available knowledge sources:');
sources.data.forEach(source => {
  console.log(`  ${source.id}: ${source.name}`);
});

// 2. Select relevant sources for your agent
const relevantSourceIds = sources.data
  .filter(s => s.type === 'faq' || s.type === 'documentation')
  .map(s => s.id);

// 3. Create instruction with knowledge sources
const model = await client.supportModels.getDefaultMultiMode();

const instruction = await client.instructionConfigs.create({
  instructionName: 'Knowledge-Enhanced Agent',
  role: 'Support Agent',
  introductionMessage: 'Hello! I have access to our knowledge base.',
  instructions: 'Use the linked knowledge sources to answer questions accurately.',
  guardrails: 'Only provide information from verified knowledge sources.',
  supportedServices: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
  knowledgeSourceIds: relevantSourceIds,
});

// 4. Create agent with the instruction
const agent = await client.agentConfigs.create({
  name: 'KnowledgeBot',
  modelId: model!.modelId,
  instructionConfigurationId: instruction.id,
});

console.log('Agent created with knowledge sources:', agent.id);
```

## Complete Example

```typescript
import { WiilClient, BusinessSupportServices } from 'wiil-js';

const client = new WiilClient({
  apiKey: process.env.WIIL_API_KEY!,
});

async function exploreKnowledgeSources() {
  // 1. List all knowledge sources
  const allSources = await client.knowledgeSources.list({
    page: 1,
    pageSize: 100,
  });

  console.log('Total knowledge sources:', allSources.meta.totalCount);

  if (allSources.data.length === 0) {
    console.log('No knowledge sources available');
    return;
  }

  // 2. Categorize by type
  const byType = new Map<string, number>();

  allSources.data.forEach(source => {
    const type = source.type || 'unknown';
    byType.set(type, (byType.get(type) || 0) + 1);
  });

  console.log('\nKnowledge sources by type:');
  byType.forEach((count, type) => {
    console.log(`  ${type}: ${count}`);
  });

  // 3. Get details of a specific source
  const sourceId = allSources.data[0].id;
  const sourceDetails = await client.knowledgeSources.get(sourceId);

  console.log('\nSource details:');
  console.log('  ID:', sourceDetails.id);
  console.log('  Name:', sourceDetails.name);
  console.log('  Type:', sourceDetails.type);

  // 4. Example: Create an agent with knowledge sources
  console.log('\nExample: Creating agent with knowledge sources...');

  const model = await client.supportModels.getDefaultMultiMode();
  if (!model) {
    console.log('No model available');
    return;
  }

  // Select first 3 knowledge sources
  const selectedSourceIds = allSources.data.slice(0, 3).map(s => s.id);

  const instruction = await client.instructionConfigs.create({
    instructionName: `KS_Test_Instructions_${Date.now()}`,
    role: 'Knowledge Base Agent',
    introductionMessage: 'Hello! I can answer questions using our knowledge base.',
    instructions: 'Answer questions using the linked knowledge sources.',
    guardrails: 'Cite sources when providing information.',
    supportedServices: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
    knowledgeSourceIds: selectedSourceIds,
  });

  console.log('Instruction created with', selectedSourceIds.length, 'knowledge sources');

  const agent = await client.agentConfigs.create({
    name: 'KnowledgeAgent',
    modelId: model.modelId,
    instructionConfigurationId: instruction.id,
  });

  console.log('Agent created:', agent.id);

  // Cleanup
  await client.agentConfigs.delete(agent.id);
  await client.instructionConfigs.delete(instruction.id);
  console.log('Cleanup complete');
}

exploreKnowledgeSources().catch(console.error);
```

## Best Practices

1. **Select relevant sources** - Only link knowledge sources that are relevant to the agent's purpose. Too many sources can slow down responses.

2. **Check source availability** - Always list and verify knowledge sources exist before referencing them in instruction configurations.

3. **Use appropriate source types** - Match source types to your use case:
   - FAQs for common questions
   - Documentation for technical details
   - Product catalogs for sales agents

4. **Keep sources updated** - Knowledge sources should be kept current. Outdated information can lead to incorrect agent responses.

## Troubleshooting

### Knowledge Source Not Found

**Error:**
```
WiilAPIError: Knowledge source not found
```

**Solution:**
Verify the source ID exists by listing available sources:

```typescript
const sources = await client.knowledgeSources.list();

const sourceIds = sources.data.map(s => s.id);
console.log('Available source IDs:', sourceIds);

// Check if your ID exists
const targetId = 'ks_123';
if (sourceIds.includes(targetId)) {
  const source = await client.knowledgeSources.get(targetId);
  console.log('Source found:', source.name);
} else {
  console.log('Source not found in available sources');
}
```

### No Knowledge Sources Available

If no knowledge sources exist, they need to be created through the WIIL Console or admin API. Knowledge sources are typically managed by administrators and include:

- Uploaded documents (PDFs, text files)
- FAQ databases
- Product catalogs
- Help center content
- Custom knowledge bases

### Invalid Knowledge Source Reference

**Error:**
```
WiilValidationError: Invalid knowledgeSourceIds
```

**Solution:**
Ensure all referenced knowledge source IDs are valid:

```typescript
const sources = await client.knowledgeSources.list();
const validIds = new Set(sources.data.map(s => s.id));

const requestedIds = ['ks_123', 'ks_456', 'ks_789'];
const invalidIds = requestedIds.filter(id => !validIds.has(id));

if (invalidIds.length > 0) {
  console.log('Invalid knowledge source IDs:', invalidIds);
}

const validRequestedIds = requestedIds.filter(id => validIds.has(id));
// Use validRequestedIds in your instruction configuration
```
