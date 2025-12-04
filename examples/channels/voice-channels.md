# Voice Call Channels Guide

**Set up AI-powered voice calls on your phone number**

**Setup Time**: ~5 minutes (including phone purchase)

---

## Overview

Voice channels enable AI agents to handle phone calls. They are **automatically created** when you purchase a phone number.

---

## Prerequisites

Before setting up voice channels:

1. ✅ Active WIIL Platform account
2. ✅ Sufficient account credits
3. ✅ Project ID
4. ✅ Agent Configuration ID
5. ✅ Instruction Configuration ID

---

## Quick Start

### Step 1: Purchase Phone Number

Voice channels are created automatically when you purchase a phone number.

```typescript
import {
  WiilClient,
  ProviderType,
  PhoneNumberType,
  PhonePurchaseStatus
} from 'wiil-js';

const client = new WiilClient({ apiKey: process.env.WIIL_API_KEY! });

const phonePurchase = await client.phoneConfigs.purchase({
  friendlyName: 'Customer Support Line',
  phoneNumber: '+12125551234',
  providerType: ProviderType.SIGNALWIRE,
  numberType: PhoneNumberType.LOCAL
});

console.log(`Purchase ID: ${phonePurchase.id}`);
console.log('Processing... (under 5 minutes)');
```

### Step 2: Get Voice Channel ID

After purchase completes, retrieve the phone configuration to get the `voiceChannelId`.

```typescript
// Wait for purchase to complete (under 5 minutes)
await new Promise(resolve => setTimeout(resolve, 300000));

const phoneConfig = await client.phoneConfigs.getByPhoneNumber('+12125551234');

console.log('Phone Configuration:');
console.log(`  Voice Channel ID: ${phoneConfig.voiceChannelId}`);
console.log(`  SMS Channel ID: ${phoneConfig.smsChannelId}`);
console.log(`  Status: ${phoneConfig.status}`);
```

**Output**:
```
Phone Configuration:
  Voice Channel ID: 2s3t4u5v6w7x8y9z0a1b
  SMS Channel ID: 3t4u5v6w7x8y9z0a1b2c
  Status: ACTIVE
```

**Important**: Save the `voiceChannelId` - you'll need it to create the deployment.

### Step 3: Create Voice Deployment

```typescript
import {
  DeploymentStatus,
  DeploymentProvisioningType
} from 'wiil-js';

const deployment = await client.deploymentConfigs.create({
  projectId: 'YOUR_PROJECT_ID',
  deploymentChannelId: phoneConfig.voiceChannelId, // ← Use voice channel ID
  agentConfigurationId: 'YOUR_AGENT_ID',
  instructionConfigurationId: 'YOUR_INSTRUCTION_ID',
  deploymentName: 'Voice Support Agent',
  isActive: true,
  deploymentStatus: DeploymentStatus.PENDING,
  provisioningType: DeploymentProvisioningType.DIRECT
});

console.log('✓ Voice deployment created!');
console.log(`Deployment ID: ${deployment.id}`);
console.log(`Call ${phoneConfig.phoneNumber} to test`);
```

### Step 4: Test Your Voice Agent

Call the phone number to test your AI agent:

```
📞 Dial: +12125551234
```

Your AI agent will answer and handle the conversation!

---

## Retrieving Voice Channel Details

### Get Channel by ID

```typescript
const voiceChannel = await client.deploymentChannels.get(phoneConfig.voiceChannelId);

console.log('Voice Channel Details:');
console.log(`  Name: ${voiceChannel.channelName}`);
console.log(`  Type: ${voiceChannel.deploymentType}`); // "CALLS"
console.log(`  Phone: ${voiceChannel.channelIdentifier}`);
console.log(`  Recording: ${voiceChannel.recordingEnabled}`);
```

### Get Channel by Phone Number

```typescript
import { DeploymentType } from 'wiil-js';

const voiceChannel = await client.deploymentChannels.getByIdentifier(
  '+12125551234',
  DeploymentType.CALLS
);

console.log(`Voice Channel ID: ${voiceChannel.id}`);
```

---

## Complete Example

```typescript
import {
  WiilClient,
  ProviderType,
  PhoneNumberType,
  PhonePurchaseStatus,
  DeploymentStatus,
  DeploymentProvisioningType
} from 'wiil-js';

async function setupVoiceChannel() {
  const client = new WiilClient({ apiKey: process.env.WIIL_API_KEY! });

  // 1. Purchase phone number
  console.log('1. Purchasing phone number...');
  const purchase = await client.phoneConfigs.purchase({
    friendlyName: 'Customer Support Line',
    phoneNumber: '+12125551234',
    providerType: ProviderType.SIGNALWIRE,
    numberType: PhoneNumberType.LOCAL
  });

  console.log(`Purchase ID: ${purchase.id}`);

  // 2. Wait for completion
  console.log('2. Waiting for purchase to complete (under 5 minutes)...');
  let phoneConfig;
  let attempts = 0;
  const maxAttempts = 60;

  while (attempts < maxAttempts) {
    try {
      phoneConfig = await client.phoneConfigs.getByPhoneNumber('+12125551234');
      if (phoneConfig.status === 'ACTIVE') {
        console.log('✓ Phone purchase completed!');
        break;
      }
    } catch (error) {
      // Phone config not ready yet
    }

    await new Promise(resolve => setTimeout(resolve, 5000));
    attempts++;
  }

  if (!phoneConfig || phoneConfig.status !== 'ACTIVE') {
    throw new Error('Phone purchase timeout');
  }

  // 3. Get voice channel ID
  console.log('3. Voice channel auto-created:');
  console.log(`   Voice Channel ID: ${phoneConfig.voiceChannelId}`);

  // 4. Create deployment
  console.log('4. Creating voice deployment...');
  const deployment = await client.deploymentConfigs.create({
    projectId: 'YOUR_PROJECT_ID',
    deploymentChannelId: phoneConfig.voiceChannelId,
    agentConfigurationId: 'YOUR_AGENT_ID',
    instructionConfigurationId: 'YOUR_INSTRUCTION_ID',
    deploymentName: 'Voice Support Agent',
    isActive: true,
    deploymentStatus: DeploymentStatus.PENDING,
    provisioningType: DeploymentProvisioningType.DIRECT
  });

  console.log('✓ Setup complete!');
  console.log(`\nYour voice agent is ready!`);
  console.log(`📞 Call: ${phoneConfig.phoneNumber}`);
  console.log(`📋 Deployment ID: ${deployment.id}`);

  return { phoneConfig, deployment };
}

setupVoiceChannel().catch(console.error);
```

---

## Multi-Language Voice Support

Configure your agent to support multiple languages:

```typescript
// In your Agent Configuration
const agentConfig = await client.agentConfigs.create({
  agentName: 'Multilingual Support Agent',
  voiceId: 'shimmer', // Supports multiple languages
  language: 'en-US', // Default language
  // Agent will auto-detect and respond in caller's language
});
```

**Supported Languages**:
- English (US, UK, AU)
- Spanish (ES, MX)
- French (FR, CA)
- German (DE)
- Italian (IT)
- Portuguese (BR, PT)
- And more...

---

## Recording Configuration

### Enable Recording

```typescript
const updatedChannel = await client.deploymentChannels.update({
  id: phoneConfig.voiceChannelId,
  recordingEnabled: true
});
```

### Disable Recording

```typescript
const updatedChannel = await client.deploymentChannels.update({
  id: phoneConfig.voiceChannelId,
  recordingEnabled: false
});
```

**Note**: Recordings are stored securely and accessible via WIIL Console.

---

## Voice-Specific Settings

### Agent Voice Selection

Choose from available voices in your Agent Configuration:

```typescript
const agentConfig = await client.agentConfigs.create({
  agentName: 'Support Agent',
  voiceId: 'alloy',    // Options: alloy, echo, fable, onyx, nova, shimmer
  language: 'en-US'
});
```


---

## Troubleshooting

### Calls not connecting
1. ✅ Verify phone purchase completed (`status: ACTIVE`)
2. ✅ Check deployment is active (`isActive: true`)
3. ✅ Ensure `voiceChannelId` is correct
4. ✅ Verify phone number has voice capability enabled
5. ✅ Check account has sufficient credits


### Agent not responding
1. ✅ Verify Agent Configuration is valid
2. ✅ Check Instruction Configuration exists
3. ✅ Review agent logs in WIIL Console
4. ✅ Test with simple instructions first


### Recording not available
1. ✅ Verify `recordingEnabled: true`
2. ✅ Wait a few minutes for processing
3. ✅ Check WIIL Console recordings section
4. ✅ Verify call completed successfully

---

## Providers

### SignalWire (Recommended)

```typescript
providerType: ProviderType.SIGNALWIRE
```

**Benefits**:
- Competitive pricing
- 99.99% uptime SLA
- Advanced features

### Twilio

```typescript
providerType: ProviderType.TWILIO
```

**Benefits**:
- Global coverage
- Established provider
- Wide number selection

---

## Next Steps

- **SMS**: [SMS Channels Guide](./sms-channels.md)
- **Management**: [Channel Management](./channel-management.md)
- **Troubleshooting**: [Troubleshooting Guide](./troubleshooting.md)
- **Phone Purchase**: [Phone Purchase Guide](./phone-purchase.md)

---

[← Back to Channels Home](./README.md)
