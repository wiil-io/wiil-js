# Knowledge Sources Guide

This guide covers managing knowledge sources using the WIIL Platform JS SDK. Knowledge sources represent repositories of information that AI agents can access for context and factual grounding.

## Quick Start

```typescript
import { WiilClient } from 'wiil-js';

const client = new WiilClient({
  apiKey: 'your-api-key',
});

// Create a text knowledge source
const source = await client.knowledgeSources.createText({
  name: 'Product FAQ',
  content: 'Your text content here (minimum 1000 characters)...',
  metadata: { category: 'support', version: '1.0' },
});

console.log('Created:', source.id);
console.log('Processing status:', source.processingStatus);

// List knowledge sources
const result = await client.knowledgeSources.list();

console.log('Total sources:', result.meta.totalCount);
result.data.forEach(source => {
  console.log(`- ${source.name} (${source.sourceType})`);
});
```

## Architecture Overview

Knowledge sources provide:

- **Information Repositories**: Documents, FAQs, product catalogs, and other data
- **Agent Context**: Factual grounding for AI agent responses
- **Referenced by Instructions**: Instruction configurations link to knowledge sources via `knowledgeSourceIds`
- **Multi-tier Storage**: Automatic optimization between Firestore (fast) and Cloud Storage (cost-effective)

### Knowledge Source Types

- `document` - Uploaded files (PDF, DOCX, TXT, etc.)
- `url` - Web page content
- `business_website` - Crawled website content
- `corpus` - Text collections (created via `createText`)
- `batch_document` - Multiple files processed together

### Processing Status

- `pending` - Awaiting processing
- `processing` - Being prepared for AI consumption
- `completed` - Ready for use
- `failed` - Processing error

## Operations

### Create Text Knowledge Source

Create a knowledge source from raw text content (minimum 1000 characters):

```typescript
const source = await client.knowledgeSources.createText({
  name: 'Company Policies',
  content: `
    Your comprehensive text content here...
    This must be at least 1000 characters long.
    Include all the information you want the AI agent to access.
    The content will be processed and optimized for AI consumption.
    ...
  `,
  metadata: {
    category: 'policies',
    department: 'HR',
    version: '2.0',
    lastUpdated: '2024-01-15',
  },
});

console.log('Created:', source.id);
console.log('Name:', source.name);
console.log('Type:', source.sourceType);  // 'corpus'
console.log('Status:', source.processingStatus);
```

### List Knowledge Sources

```typescript
// List with default pagination
const result = await client.knowledgeSources.list();

console.log('Total knowledge sources:', result.meta.totalCount);
console.log('Page:', result.meta.page, 'of', result.meta.totalPages);

result.data.forEach(source => {
  console.log(`${source.name}:`);
  console.log(`  ID: ${source.id}`);
  console.log(`  Type: ${source.sourceType}`);
  console.log(`  Status: ${source.processingStatus}`);
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
console.log('  Type:', source.sourceType);
console.log('  Status:', source.processingStatus);
console.log('  Storage Tier:', source.storage_tier);
console.log('  Access Count:', source.access_count);

if (source.content_size) {
  console.log('  Content Size:', `${(source.content_size / 1024).toFixed(2)} KB`);
}

console.log('  Created:', new Date(source.createdAt).toISOString());
```

## API Reference

### `createText(data)` - Create text knowledge source

```typescript
const source = await client.knowledgeSources.createText({
  name: 'FAQ Document',           // Optional - server may auto-name
  content: 'Text content...',     // Required - min 1000 chars
  metadata: { key: 'value' },     // Optional
});
// Returns: KnowledgeSource
```

### `get(id)` - Get by ID

```typescript
const source = await client.knowledgeSources.get('ks_123');
// Returns: KnowledgeSource
```

### `list(params?)` - List with pagination

```typescript
const result = await client.knowledgeSources.list({ page: 1, pageSize: 50 });
// Returns: PaginatedResultType<KnowledgeSource>
```

## Using Knowledge Sources with Instructions

Knowledge sources provide context for AI agents through instruction configurations:

```typescript
// 1. Create a knowledge source
const faqSource = await client.knowledgeSources.createText({
  name: 'Product FAQ',
  content: `
    Q: What are your business hours?
    A: We are open Monday through Friday, 9 AM to 5 PM EST.
    
    Q: How do I return a product?
    A: You can return any product within 30 days for a full refund...
    
    ... (continue with at least 1000 characters of FAQ content)
  `,
});

// 2. Wait for processing to complete (poll or check later)
console.log('Processing status:', faqSource.processingStatus);

// 3. List all available knowledge sources
const sources = await client.knowledgeSources.list();
const completedSources = sources.data.filter(
  s => s.processingStatus === 'completed'
);

// 4. Create instruction with knowledge sources
const model = await client.supportModels.getDefaultMultiMode();

const instruction = await client.instructionConfigs.create({
  instructionName: 'Knowledge-Enhanced Agent',
  role: 'Support Agent',
  introductionMessage: 'Hello! I have access to our knowledge base.',
  instructions: 'Use the linked knowledge sources to answer questions accurately.',
  guardrails: 'Only provide information from verified knowledge sources.',
  supportedServices: ['APPOINTMENT_MANAGEMENT'],
  knowledgeSourceIds: completedSources.map(s => s.id),
});

// 5. Create agent with the instruction
const agent = await client.agentConfigs.create({
  name: 'KnowledgeBot',
  modelId: model!.modelId,
  instructionConfigurationId: instruction.id,
});

console.log('Agent created with knowledge sources:', agent.id);
```

## Complete Example

```typescript
import { WiilClient } from 'wiil-js';

const client = new WiilClient({
  apiKey: process.env.WIIL_API_KEY!,
});

async function knowledgeSourceWorkflow() {
  // 1. Create a text knowledge source
  console.log('Creating knowledge source...');
  
  const content = `
    Product Support Knowledge Base
    ==============================
    
    Getting Started
    ---------------
    Welcome to our product! This guide will help you get started quickly.
    
    Installation
    ------------
    1. Download the installer from our website
    2. Run the installer with administrator privileges
    3. Follow the on-screen instructions
    4. Restart your computer when prompted
    
    Common Issues
    -------------
    Q: The application won't start
    A: Try running as administrator or reinstalling the application.
    
    Q: I forgot my password
    A: Click "Forgot Password" on the login screen to reset it.
    
    Q: How do I contact support?
    A: Email support@example.com or call 1-800-EXAMPLE.
    
    ... (additional content to meet 1000 character minimum)
  `;

  const source = await client.knowledgeSources.createText({
    name: 'Product Support KB',
    content: content,
    metadata: {
      category: 'support',
      product: 'main-app',
      version: '1.0',
    },
  });

  console.log('Created knowledge source:', source.id);
  console.log('Processing status:', source.processingStatus);

  // 2. List all knowledge sources
  const allSources = await client.knowledgeSources.list();
  console.log('\nTotal knowledge sources:', allSources.meta.totalCount);

  // 3. Categorize by type
  const byType = new Map<string, number>();
  allSources.data.forEach(s => {
    const type = s.sourceType || 'unknown';
    byType.set(type, (byType.get(type) || 0) + 1);
  });

  console.log('\nKnowledge sources by type:');
  byType.forEach((count, type) => {
    console.log(`  ${type}: ${count}`);
  });

  // 4. Categorize by processing status
  const byStatus = new Map<string, number>();
  allSources.data.forEach(s => {
    const status = s.processingStatus || 'unknown';
    byStatus.set(status, (byStatus.get(status) || 0) + 1);
  });

  console.log('\nKnowledge sources by status:');
  byStatus.forEach((count, status) => {
    console.log(`  ${status}: ${count}`);
  });

  // 5. Get details of the created source
  const sourceDetails = await client.knowledgeSources.get(source.id);

  console.log('\nSource details:');
  console.log('  ID:', sourceDetails.id);
  console.log('  Name:', sourceDetails.name);
  console.log('  Type:', sourceDetails.sourceType);
  console.log('  Status:', sourceDetails.processingStatus);
  console.log('  Storage Tier:', sourceDetails.storage_tier);
}

knowledgeSourceWorkflow().catch(console.error);
```

## Best Practices

1. **Provide meaningful names** - Use descriptive names that indicate the content purpose.

2. **Structure content well** - Organize text content with clear headings and sections for better AI comprehension.

3. **Include metadata** - Add relevant metadata (categories, versions, dates) for organization and filtering.

4. **Check processing status** - Wait for `completed` status before using knowledge sources in instruction configurations.

5. **Select relevant sources** - Only link knowledge sources that are relevant to the agent's purpose. Too many sources can slow down responses.

6. **Keep sources updated** - Create new versions of knowledge sources when content changes significantly.

## Troubleshooting

### Content Too Short

**Error:**
```
WiilValidationError: Content must be at least 1000 characters
```

**Solution:**
Ensure your content is at least 1000 characters:

```typescript
const content = '...your text...';
console.log('Content length:', content.length);

if (content.length < 1000) {
  console.log('Need', 1000 - content.length, 'more characters');
}
```

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

const targetId = 'ks_123';
if (sourceIds.includes(targetId)) {
  const source = await client.knowledgeSources.get(targetId);
  console.log('Source found:', source.name);
} else {
  console.log('Source not found');
}
```

### Processing Failed

If a knowledge source has `processingStatus: 'failed'`, the content could not be processed. Check:

- Content is valid text (not binary data)
- Content is at least 1000 characters
- No encoding issues

```typescript
const source = await client.knowledgeSources.get('ks_123');

if (source.processingStatus === 'failed') {
  console.log('Processing failed for:', source.name);
  // Create a new knowledge source with corrected content
}
```
