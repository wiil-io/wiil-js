# Translation Sessions Guide

This guide covers managing real-time translation sessions using the WIIL Platform JS SDK. Translation sessions represent the durable root for participant-to-participant translation operations.

## Quick Start

```typescript
import { WiilService } from 'wiil-js';

const service = new WiilService({
  apiKey: 'your-api-key',
});

// Initiate a translation session
const access = await service.translation.initiate({
  initiator: {
    externalParticipantId: 'user_123',
    language: 'en',
    displayName: 'John',
  },
  participant: {
    language: 'es',
  },
});

console.log('Session ID:', access.translationSessionId);
console.log('Channel:', access.channelIdentifier);
```

## Architecture Overview

Translation sessions provide:

- **Session Records**: Durable root for participant-to-participant translations
- **Lifecycle Tracking**: Status progression (pending → active → completed)
- **Duration Metrics**: Start/end timestamps and total duration
- **State History**: Ordered lifecycle transition records for audit
- **Participant Management**: Add, update, and remove participants

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

### Initiate a Translation Session

The `initiate` method creates a session and returns runtime access credentials for both participants:

```typescript
const access = await service.translation.initiate({
  initiator: {
    externalParticipantId: 'user_123',
    language: 'en',
    displayName: 'Support Agent',
  },
  participant: {
    language: 'ja',
    displayName: 'Customer',
  },
  direction: 'bidirectional',
});

console.log('Session ID:', access.translationSessionId);
console.log('Channel:', access.channelIdentifier);
console.log('Initiator Token:', access.initiator.token);
console.log('Participant Token:', access.participant.token);
```

### List Translation Sessions

```typescript
// List with default pagination
const result = await service.translation.list();

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
const result = await service.translation.list({
  page: 2,
  pageSize: 50,
});

console.log(`Page ${result.meta.page} of ${result.meta.totalPages}`);
console.log(`Showing ${result.data.length} of ${result.meta.totalCount} sessions`);
```

### Get Translation Session by ID

```typescript
const session = await service.translation.get('session_123');

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

### Query Sessions

```typescript
// By organization
const orgSessions = await service.translation.getByOrganization('org_123');

// By project
const projectSessions = await service.translation.getByProject('proj_456');

// By status
const activeSessions = await service.translation.getByStatus('active');

// By date range (UTC seconds)
const now = Math.floor(Date.now() / 1000);
const lastWeek = now - 7 * 24 * 60 * 60;
const recentSessions = await service.translation.getByDateRange(lastWeek, now);
```

### Manage Participants

```typescript
const sessionId = 'session_123';

// Get participants
const participants = await service.translation.getParticipants(sessionId);

// Add a participant
const newParticipant = await service.translation.addParticipant(sessionId, {
  translationSessionId: sessionId,
  role: 'participant',
  language: 'fr',
  displayName: 'Translator',
});

// Update a participant
const updated = await service.translation.updateParticipant(sessionId, {
  id: newParticipant.id,
  displayName: 'Senior Translator',
});

// Remove a participant
await service.translation.removeParticipant(sessionId, newParticipant.id);
```

### Session Lifecycle

```typescript
const sessionId = 'session_123';

// Update session status
await service.translation.updateStatus(sessionId, 'active');

// End session
const ended = await service.translation.end(sessionId);
console.log('Session ended at:', new Date(ended.endedAt! * 1000).toISOString());

// Generate summary
const withSummary = await service.translation.generateSummary(sessionId);
console.log('Summary:', withSummary.summary);
```

## Complete Example

```typescript
import { WiilService } from 'wiil-js';

const service = new WiilService({
  apiKey: process.env.WIIL_API_KEY!,
});

async function translationWorkflow() {
  // 1. Initiate a translation session
  const access = await service.translation.initiate({
    initiator: {
      externalParticipantId: 'agent_001',
      language: 'en',
      displayName: 'Support Agent',
    },
    participant: {
      language: 'es',
      displayName: 'Customer',
    },
    direction: 'bidirectional',
  });

  console.log('Session initiated:', access.translationSessionId);
  console.log('Channel:', access.channelIdentifier);

  // 2. Get session details
  const session = await service.translation.get(access.translationSessionId);
  console.log('Status:', session.status);

  // 3. List all sessions and analyze
  const allSessions = await service.translation.list({ pageSize: 100 });

  console.log('\nTotal sessions:', allSessions.meta.totalCount);

  // Analyze status distribution
  const statusCounts = new Map<string, number>();
  allSessions.data.forEach(s => {
    statusCounts.set(s.status, (statusCounts.get(s.status) || 0) + 1);
  });

  console.log('\nStatus distribution:');
  statusCounts.forEach((count, status) => {
    console.log(`  ${status}: ${count}`);
  });

  // 4. Calculate average duration for completed sessions
  const completed = allSessions.data.filter(
    s => s.status === 'completed' && s.durationInSeconds
  );

  if (completed.length > 0) {
    const avgDuration = completed.reduce(
      (sum, s) => sum + (s.durationInSeconds || 0), 0
    ) / completed.length;
    console.log(`\nAverage duration: ${Math.round(avgDuration)}s`);
  }

  // 5. Display state history
  if (session.stateHistory && session.stateHistory.length > 0) {
    console.log('\nState history:');
    session.stateHistory.forEach(entry => {
      const time = new Date(entry.timestamp * 1000).toISOString();
      console.log(`  ${time}: ${entry.status}${entry.reason ? ` (${entry.reason})` : ''}`);
    });
  }
}

translationWorkflow().catch(console.error);
```

## Working with Timestamps

Translation session timestamps are in **UTC seconds**. Multiply by 1000 for JavaScript Date:

```typescript
const session = await service.translation.get('session_123');

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

## API Reference

The `TranslationService` exposes the following methods via `service.translation`:

### Session Management

#### `initiate(data)` - Create session with runtime credentials

```typescript
const access = await service.translation.initiate({
  initiator: { externalParticipantId: 'user_123', language: 'en' },
  participant: { language: 'es' },
  direction: 'bidirectional',
});
// Returns: TranslationSessionAccess
```

#### `create(data)` - Create a session directly

```typescript
const session = await service.translation.create({
  externalInitiatorId: 'user_123',
  direction: 'bidirectional',
});
// Returns: TranslationSession
```

#### `get(id)` - Get session by ID

```typescript
const session = await service.translation.get('session_123');
// Returns: TranslationSession
```

#### `list(params?)` - List all sessions

```typescript
const result = await service.translation.list({ page: 1, pageSize: 50 });
// Returns: PaginatedResultType<TranslationSession>
```

#### `getByOrganization(orgId, params?)` - List by organization

```typescript
const result = await service.translation.getByOrganization('org_123');
// Returns: PaginatedResultType<TranslationSession>
```

#### `getByProject(projectId, params?)` - List by project

```typescript
const result = await service.translation.getByProject('proj_456');
// Returns: PaginatedResultType<TranslationSession>
```

#### `getByStatus(status, params?)` - List by status

```typescript
const result = await service.translation.getByStatus('active');
// Returns: PaginatedResultType<TranslationSession>
```

#### `getByDateRange(startDate, endDate, params?)` - List by date range

```typescript
const now = Math.floor(Date.now() / 1000);
const lastWeek = now - 7 * 24 * 60 * 60;
const result = await service.translation.getByDateRange(lastWeek, now);
// Returns: PaginatedResultType<TranslationSession>
```

#### `update(data)` - Update session fields

```typescript
const updated = await service.translation.update({
  id: 'session_123',
  summary: 'Customer support call',
});
// Returns: TranslationSession
```

#### `updateStatus(id, status)` - Update session status

```typescript
const updated = await service.translation.updateStatus('session_123', 'active');
// Returns: TranslationSession
```

#### `end(id)` - End a session

```typescript
const ended = await service.translation.end('session_123');
// Returns: TranslationSession
```

#### `generateSummary(id)` - Generate AI summary

```typescript
const withSummary = await service.translation.generateSummary('session_123');
// Returns: TranslationSession
```

#### `delete(id)` - Delete a session

```typescript
const deleted = await service.translation.delete('session_123');
// Returns: boolean
```

### Participant Management

#### `getParticipants(sessionId, params?)` - List participants

```typescript
const result = await service.translation.getParticipants('session_123');
// Returns: PaginatedResultType<TranslationParticipant>
```

#### `addParticipant(sessionId, data)` - Add participant

```typescript
const participant = await service.translation.addParticipant('session_123', {
  translationSessionId: 'session_123',
  role: 'participant',
  language: 'fr',
  displayName: 'Translator',
});
// Returns: TranslationParticipant
```

#### `updateParticipant(sessionId, data)` - Update participant

```typescript
const updated = await service.translation.updateParticipant('session_123', {
  id: 'participant_456',
  displayName: 'Senior Translator',
});
// Returns: TranslationParticipant
```

#### `removeParticipant(sessionId, participantId)` - Remove participant

```typescript
const removed = await service.translation.removeParticipant('session_123', 'participant_456');
// Returns: boolean
```

## Best Practices

1. **Use `initiate()` for new sessions** - This creates the session and returns runtime credentials in one call.

2. **Use pagination for large datasets** - Translation sessions accumulate quickly. Always paginate.

3. **Check session status** - Use `getByStatus()` to find active, completed, or failed sessions.

4. **Handle timestamps correctly** - Multiply by 1000 when converting UTC seconds to JavaScript Date.

5. **Generate summaries after completion** - Call `generateSummary()` after ending a session.

## Troubleshooting

### Session Not Found

**Error:**

```
WiilAPIError: Translation session not found
```

**Solution:**
Verify the session ID exists by listing available sessions first:

```typescript
const sessions = await service.translation.list();

if (sessions.data.length > 0) {
  const session = await service.translation.get(sessions.data[0].id);
  console.log('Session found:', session.id);
} else {
  console.log('No translation sessions available');
}
```

### No Sessions Available

If no translation sessions exist, create one using `initiate()`:

```typescript
const access = await service.translation.initiate({
  initiator: {
    externalParticipantId: 'user_123',
    language: 'en',
  },
  participant: {
    language: 'es',
  },
});

console.log('Created session:', access.translationSessionId);
```
