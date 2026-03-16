# Deployment Channels Guide

This guide covers creating and managing deployment channels using the WIIL Platform JS SDK. Deployment channels define the communication endpoints (phone numbers, web URLs, mobile apps) through which AI agents are accessible.

## Quick Start

```typescript
import { WiilClient, DeploymentType } from 'wiil-js';

const client = new WiilClient({
  apiKey: 'your-api-key',
});

// Create a web deployment channel
const channel = await client.deploymentChannels.create({
  channelIdentifier: 'https://example.com',
  deploymentType: DeploymentType.WEB,
  channelName: 'Main Website Chat',
  recordingEnabled: true,
  configuration: {
    communicationType: 'unified',
    widgetConfiguration: {
      position: 'right',
      customTheme: {
        primaryColor: '#007bff',
      },
    },
  },
});

console.log('Channel created:', channel.id);
```

## Architecture Overview

Deployment channels define the single communication endpoint through which a deployment is accessible:

- **1:1 Relationship**: Each Deployment Configuration has exactly one Deployment Channel
- **Multi-Channel Pattern**: To expose an agent through multiple channels (phone + web), create separate Deployment Configurations
- **Channel Types**: Phone (calls/SMS), Web (chat widget), Mobile (native apps)

## Enums

### DeploymentType

```typescript
enum DeploymentType {
  CALLS = 'calls',      // Voice phone calls
  SMS = 'sms',          // SMS text messaging
  WEB = 'web',          // Browser-based chat widget
  MOBILE = 'mobile-app' // Native mobile applications
}
```

### DeploymentStatus

```typescript
enum DeploymentStatus {
  PENDING = 'pending',   // Created but not yet activated
  ACTIVE = 'active',     // Operational
  PAUSED = 'paused',     // Temporarily suspended
  ARCHIVED = 'archived'  // Decommissioned
}
```

## Deployment Channel Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| channelIdentifier | string | Yes | Phone number (E.164), URL, or package name |
| deploymentType | DeploymentType | Yes | Channel type (CALLS, SMS, WEB, MOBILE) |
| channelName | string | No | Human-readable name |
| recordingEnabled | boolean | No | Record interactions (default: true) |
| configuration | object | Yes | Type-specific configuration |

### Channel Configuration by Type

**Phone Channels (CALLS/SMS)**:
```typescript
{
  phoneConfigurationId: string  // Reference to PhoneConfiguration resource
}
```

**Web Channels**:
```typescript
{
  communicationType: 'text' | 'voice' | 'unified',
  widgetConfiguration?: {
    position: 'left' | 'right',
    customTheme?: Record<string, string>
  }
}
```

**Mobile Channels**:
```typescript
{
  packageName: string,
  platform: 'ios' | 'android'
}
```

## CRUD Operations

### Create Deployment Channel

```typescript
// Web Channel
const webChannel = await client.deploymentChannels.create({
  channelIdentifier: 'https://example.com',
  deploymentType: DeploymentType.WEB,
  channelName: 'Website Chat Widget',
  recordingEnabled: true,
  configuration: {
    communicationType: 'unified',
    widgetConfiguration: {
      position: 'right',
      customTheme: { primaryColor: '#0066cc' },
    },
  },
});

console.log('Web channel created:', webChannel.id);
```

### Get Deployment Channel

```typescript
// Get by ID
const channel = await client.deploymentChannels.get('channel_123');
console.log('Channel name:', channel.channelName);
console.log('Channel type:', channel.deploymentType);

// Get by identifier and type
const webChannel = await client.deploymentChannels.getByIdentifier(
  'https://example.com',
  DeploymentType.WEB
);
console.log('Found channel:', webChannel.id);
```

### List Deployment Channels

```typescript
// List all channels
const result = await client.deploymentChannels.list({
  page: 1,
  pageSize: 20,
});

console.log('Total channels:', result.meta.totalCount);
result.data.forEach(channel => {
  console.log(`- ${channel.channelName} (${channel.deploymentType})`);
});

// List by type
const webChannels = await client.deploymentChannels.listByType(
  DeploymentType.WEB,
  { page: 1, pageSize: 20 }
);

console.log('Web channels:', webChannels.data.length);
```

### Update Deployment Channel

```typescript
const updated = await client.deploymentChannels.update({
  id: 'channel_123',
  channelName: 'Updated Channel Name',
  recordingEnabled: false,
});

console.log('Updated channel:', updated.channelName);
```

### Delete Deployment Channel

```typescript
// Delete channel only
const deleted = await client.deploymentChannels.delete('channel_123');

// Delete channel and associated phone configuration
const deletedWithPhone = await client.deploymentChannels.delete('channel_123', {
  deletePhoneConfig: true,
});

if (deleted) {
  console.log('Channel deleted successfully');
}
```

## Channel Type Examples

### Web Chat Widget

```typescript
const webChannel = await client.deploymentChannels.create({
  channelIdentifier: 'https://support.example.com',
  deploymentType: DeploymentType.WEB,
  channelName: 'Support Portal Chat',
  recordingEnabled: true,
  configuration: {
    communicationType: 'unified',
    widgetConfiguration: {
      position: 'right',
      customTheme: {
        primaryColor: '#4CAF50',
        fontFamily: 'Arial, sans-serif',
      },
    },
  },
});
```

### Phone Call Channel

```typescript
// First, ensure you have a phone configuration
const phoneChannel = await client.deploymentChannels.create({
  channelIdentifier: '+12025551234',
  deploymentType: DeploymentType.CALLS,
  channelName: 'Customer Support Line',
  recordingEnabled: true,
  configuration: {
    phoneConfigurationId: 'phone_config_123',
  },
});
```

### SMS Channel

```typescript
const smsChannel = await client.deploymentChannels.create({
  channelIdentifier: '+12025551234',
  deploymentType: DeploymentType.SMS,
  channelName: 'SMS Support',
  recordingEnabled: true,
  configuration: {
    phoneConfigurationId: 'phone_config_123',
  },
});
```

## Complete Example

Full workflow demonstrating deployment channel lifecycle:

```typescript
import { WiilClient, DeploymentType } from 'wiil-js';

const client = new WiilClient({
  apiKey: process.env.WIIL_API_KEY!,
});

async function manageDeploymentChannels() {
  // 1. Create a web deployment channel
  const webChannel = await client.deploymentChannels.create({
    channelIdentifier: `https://test-${Date.now()}.example.com`,
    deploymentType: DeploymentType.WEB,
    channelName: 'Test Web Channel',
    recordingEnabled: true,
    configuration: {
      communicationType: 'unified',
      widgetConfiguration: {
        position: 'right',
        customTheme: { primaryColor: '#007bff' },
      },
    },
  });

  console.log('Channel created:', webChannel.id);

  // 2. Retrieve channel by ID
  const retrieved = await client.deploymentChannels.get(webChannel.id);
  console.log('Retrieved channel:', retrieved.channelName);

  // 3. List all web channels
  const webChannels = await client.deploymentChannels.listByType(DeploymentType.WEB);
  console.log('Total web channels:', webChannels.meta.totalCount);

  // 4. Update channel configuration
  const updated = await client.deploymentChannels.update({
    id: webChannel.id,
    channelName: 'Updated Test Channel',
    recordingEnabled: false,
  });

  console.log('Updated channel name:', updated.channelName);
  console.log('Recording enabled:', updated.recordingEnabled);

  // 5. Find channel by identifier
  const found = await client.deploymentChannels.getByIdentifier(
    webChannel.channelIdentifier,
    DeploymentType.WEB
  );
  console.log('Found by identifier:', found.id);

  // 6. Clean up
  await client.deploymentChannels.delete(webChannel.id);
  console.log('Channel deleted');
}

manageDeploymentChannels().catch(console.error);
```

## Best Practices

1. **Use descriptive channel names** - Channel names appear in administrative interfaces. Use clear names that indicate the channel's purpose.

2. **Enable recording for compliance** - Keep recording enabled unless there's a specific reason to disable it. Recordings help with quality assurance and compliance.

3. **Match channel identifier format to type** - Use E.164 format for phone numbers (+12025551234), valid URLs for web channels, and package names for mobile.

4. **One channel per deployment** - Each deployment configuration has exactly one channel. Create separate deployments for multi-channel agents.

5. **Use listByType for filtering** - When you need channels of a specific type, use `listByType()` for better performance.

## Troubleshooting

### Invalid Channel Identifier

**Error:**
```
WiilValidationError: Invalid website URL format
```

**Solution:**
Ensure the identifier matches the expected format for the deployment type:

```typescript
// Web channels: valid URL
channelIdentifier: 'https://example.com'  // Correct
channelIdentifier: 'example.com'          // May fail validation

// Phone channels: E.164 format
channelIdentifier: '+12025551234'         // Correct
channelIdentifier: '202-555-1234'         // May fail validation
```

### Missing Phone Configuration

**Error:**
```
WiilAPIError: Phone configuration not found
```

**Solution:**
Create or reference a valid phone configuration before creating phone/SMS channels:

```typescript
// Ensure phone config exists
const phoneConfigs = await client.phoneConfigurations.list();
const phoneConfigId = phoneConfigs.data[0]?.id;

if (!phoneConfigId) {
  throw new Error('No phone configuration available');
}

const channel = await client.deploymentChannels.create({
  channelIdentifier: '+12025551234',
  deploymentType: DeploymentType.CALLS,
  configuration: {
    phoneConfigurationId: phoneConfigId,  // Must be valid
  },
});
```

### Channel Already Exists

**Error:**
```
WiilAPIError: Channel identifier already in use
```

**Solution:**
Channel identifiers must be unique per deployment type. Check for existing channels first:

```typescript
try {
  const existing = await client.deploymentChannels.getByIdentifier(
    'https://example.com',
    DeploymentType.WEB
  );
  console.log('Channel already exists:', existing.id);
} catch (error) {
  // Channel doesn't exist, safe to create
  const newChannel = await client.deploymentChannels.create({...});
}
```
