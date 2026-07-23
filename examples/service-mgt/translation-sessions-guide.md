# Translation Sessions Guide

This guide covers accessing translation session records using the WIIL Platform JS SDK. Translation sessions represent the durable root for participant-to-participant translation operations.

## Quick Start

```typescript
import { WiilClient } from 'wiil-js';

const client = new WiilClient({
  apiKey: 'your-api-key',
});

// List translation sessions
const result = await client.translationSessions.list();

console.log('Total sessions:', result.meta.totalCount);
result.data.forEach(session => {
  console.log(`- ${session.id}: ${session.status} (${session.direction})`);
});
```

## Architecture Overview

Translation sessions provide:

- **Session Records**: Durable root for participant-to-participant translations
- **Lifecycle Tracking**: Status progression (pending → active → completed)
- **Duration Metrics**: Start/end timestamps and total duration
- **State History**: Ordered lifecycle transition records for audit

### Session Structure

```typescript
interface TranslationSession {
  id: string;
  organizationId: string;
  projectId?: string;
  externalInitiatorId: string;      // External party that initiated
  externalSessionId?: string;        // External session reference
  translationConfigId?: string;      // Configuration used
  sdrtnId?: string;                  // Real-time networking session ID
  direction: 'bidirectional' | 'unidirectional';
  status: 'pending' | 'active' | 'paused' | 'completed' | 'failed' | 'cancelled';
  startedAt?: number;                // Unix timestamp (UTC seconds)
  endedAt?: number;                  // Unix timestamp (UTC seconds)
  durationInSeconds?: number;        // Total active duration
  summary?: string;                  // Session summary
  stateHistory?: TranslationSessionStateHistory[];
  metadata?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}
```

## Operations

### List Translation Sessions

```typescript
// List with default pagination
const result = await client.translationSessions.list();

console.log('Total sessions:', result.meta.totalCount);
console.log('Page:', result.meta.page, 'of', result.meta.totalPages);

result.data.forEach(session => {
  console.log(`Session ${session.id}:`);
  console.log(`  Status: ${session.status}`);
  console.log(`  Direction: ${session.direction}`);
  if (session.durationInSeconds) {
    console.log(`  Duration: ${session.durationInSeconds}s`);
  }
});
```

### List with Custom Pagination

```typescript
const result = await client.translationSessions.list({
  page: 2,
  pageSize: 50,
});

console.log(`Page ${result.meta.page} of ${result.meta.totalPages}`);
console.log(`Showing ${result.data.length} of ${result.meta.totalCount} sessions`);
```

### Get Translation Session by ID

```typescript
const session = await client.translationSessions.get('session_123');

console.log('Session ID:', session.id);
console.log('Status:', session.status);
console.log('Direction:', session.direction);
console.log('External Initiator:', session.externalInitiatorId);

if (session.startedAt) {
  console.log('Started:', new Date(session.startedAt * 1000).toISOString());
}
if (session.endedAt) {
  console.log('Ended:', new Date(session.endedAt * 1000).toISOString());
}
if (session.durationInSeconds) {
  console.log('Duration:', `${Math.floor(session.durationInSeconds / 60)}m ${session.durationInSeconds % 60}s`);
}
```

## Complete Example

```typescript
import { WiilClient } from 'wiil-js';

const client = new WiilClient({
  apiKey: process.env.WIIL_API_KEY!,
});

async function exploreTranslationSessions() {
  // 1. List all translation sessions
  const allSessions = await client.translationSessions.list({
    page: 1,
    pageSize: 100,
  });

  console.log('Total translation sessions:', allSessions.meta.totalCount);

  if (allSessions.data.length === 0) {
    console.log('No translation sessions available');
    return;
  }

  // 2. Analyze session statuses
  const statusCounts = new Map<string, number>();

  allSessions.data.forEach(session => {
    statusCounts.set(session.status, (statusCounts.get(session.status) || 0) + 1);
  });

  console.log('\nSession status distribution:');
  statusCounts.forEach((count, status) => {
    console.log(`  ${status}: ${count} sessions`);
  });

  // 3. Calculate average duration for completed sessions
  const completedSessions = allSessions.data.filter(
    s => s.status === 'completed' && s.durationInSeconds
  );

  if (completedSessions.length > 0) {
    const totalDuration = completedSessions.reduce(
      (sum, s) => sum + (s.durationInSeconds || 0),
      0
    );
    const avgDuration = totalDuration / completedSessions.length;

    console.log(`\nAverage session duration: ${Math.round(avgDuration)}s`);
  }

  // 4. Get details of a specific session
  const sessionId = allSessions.data[0].id;
  const sessionDetails = await client.translationSessions.get(sessionId);

  console.log('\nSession details:');
  console.log('  ID:', sessionDetails.id);
  console.log('  Status:', sessionDetails.status);
  console.log('  Direction:', sessionDetails.direction);
  console.log('  External Initiator:', sessionDetails.externalInitiatorId);

  // 5. Display state history if available
  if (sessionDetails.stateHistory && sessionDetails.stateHistory.length > 0) {
    console.log('\nState history:');
    sessionDetails.stateHistory.forEach(entry => {
      const time = new Date(entry.timestamp * 1000).toISOString();
      console.log(`  ${time}: ${entry.status}${entry.reason ? ` (${entry.reason})` : ''}`);
    });
  }
}

exploreTranslationSessions().catch(console.error);
```

## Working with Timestamps

Translation session timestamps are in **UTC seconds**. Multiply by 1000 for JavaScript Date:

```typescript
const session = await client.translationSessions.get('session_123');

// Convert to JavaScript Date
if (session.startedAt) {
  const startDate = new Date(session.startedAt * 1000);
  console.log('Started:', startDate.toLocaleString());
}

if (session.endedAt) {
  const endDate = new Date(session.endedAt * 1000);
  console.log('Ended:', endDate.toLocaleString());
}

// Format duration
if (session.durationInSeconds) {
  const minutes = Math.floor(session.durationInSeconds / 60);
  const seconds = session.durationInSeconds % 60;
  console.log(`Duration: ${minutes}m ${seconds}s`);
}
```

## Best Practices

1. **Use pagination for large datasets** - Translation sessions can accumulate quickly. Always use pagination to avoid loading too much data.

2. **Check session status** - Filter by status to find active, completed, or failed sessions.

3. **Check for empty results** - Always check if `data.length > 0` before accessing session details.

4. **Handle timestamps correctly** - Remember to multiply by 1000 when converting to JavaScript Date.

## Troubleshooting

### Session Not Found

**Error:**
```
WiilAPIError: Translation session not found
```

**Solution:**
Verify the session ID exists by listing available sessions first:

```typescript
const sessions = await client.translationSessions.list();

if (sessions.data.length > 0) {
  const session = await client.translationSessions.get(sessions.data[0].id);
  console.log('Session found:', session.id);
} else {
  console.log('No translation sessions available');
}
```

### No Sessions Available

If no translation sessions exist, they will be created automatically as translation operations occur through the platform. Translation sessions are generated by:

- Real-time translation services via `WiilService.translationServices.initiate()`
- Translation provisioning chains
- Multi-language agent interactions
