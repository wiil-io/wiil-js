# SMS Channels Guide

**Set up AI-powered text messaging on your phone number**

**Setup Time**: ~5 minutes (including phone purchase)

---

## Overview

SMS channels enable AI agents to handle text messages. They are **automatically created** when you purchase a phone number.

---

## Prerequisites

Before setting up SMS channels:

1. ✅ Active WIIL Platform account
2. ✅ Sufficient account credits
3. ✅ Project ID
4. ✅ Agent Configuration ID
5. ✅ Instruction Configuration ID

---

## Quick Start

### Step 1: Purchase Phone Number

SMS channels are created automatically when you purchase a phone number.

```typescript
import {
  WiilClient,
  ProviderType,
  PhoneNumberType,
  PhonePurchaseStatus
} from 'wiil-js';

const client = new WiilClient({ apiKey: process.env.WIIL_API_KEY! });

const phonePurchase = await client.phoneConfigs.purchase({
  friendlyName: 'Customer Support SMS',
  phoneNumber: '+12125551234',
  providerType: ProviderType.SIGNALWIRE,
  numberType: PhoneNumberType.LOCAL
});

console.log(`Purchase ID: ${phonePurchase.id}`);
console.log('Processing... (under 5 minutes)');
```

### Step 2: Get SMS Channel ID

After purchase completes, retrieve the phone configuration to get the `smsChannelId`.

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

**Important**: Save the `smsChannelId` - you'll need it to create the deployment.

### Step 3: Create SMS Deployment

```typescript
import {
  DeploymentStatus,
  DeploymentProvisioningType
} from 'wiil-js';

const deployment = await client.deploymentConfigs.create({
  projectId: 'YOUR_PROJECT_ID',
  deploymentChannelId: phoneConfig.smsChannelId, // ← Use SMS channel ID
  agentConfigurationId: 'YOUR_AGENT_ID',
  instructionConfigurationId: 'YOUR_INSTRUCTION_ID',
  deploymentName: 'SMS Support Agent',
  isActive: true,
  deploymentStatus: DeploymentStatus.PENDING,
  provisioningType: DeploymentProvisioningType.DIRECT
});

console.log('✓ SMS deployment created!');
console.log(`Deployment ID: ${deployment.id}`);
console.log(`Text ${phoneConfig.phoneNumber} to test`);
```

### Step 4: Test Your SMS Agent

Send a text message to test your AI agent:

```
📱 Text to: +12125551234
Message: "Hello! I need help with my order."
```

Your AI agent will respond via SMS!

---

## Retrieving SMS Channel Details

### Get Channel by ID

```typescript
const smsChannel = await client.deploymentChannels.get(phoneConfig.smsChannelId);

console.log('SMS Channel Details:');
console.log(`  Name: ${smsChannel.channelName}`);
console.log(`  Type: ${smsChannel.deploymentType}`); // "SMS"
console.log(`  Phone: ${smsChannel.channelIdentifier}`);
console.log(`  Recording: ${smsChannel.recordingEnabled}`);
```

### Get Channel by Phone Number

```typescript
import { DeploymentType } from 'wiil-js';

const smsChannel = await client.deploymentChannels.getByIdentifier(
  '+12125551234',
  DeploymentType.SMS
);

console.log(`SMS Channel ID: ${smsChannel.id}`);
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

async function setupSMSChannel() {
  const client = new WiilClient({ apiKey: process.env.WIIL_API_KEY! });

  // 1. Purchase phone number
  console.log('1. Purchasing phone number...');
  const purchase = await client.phoneConfigs.purchase({
    friendlyName: 'Customer Support SMS',
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

  // 3. Get SMS channel ID
  console.log('3. SMS channel auto-created:');
  console.log(`   SMS Channel ID: ${phoneConfig.smsChannelId}`);

  // 4. Create deployment
  console.log('4. Creating SMS deployment...');
  const deployment = await client.deploymentConfigs.create({
    projectId: 'YOUR_PROJECT_ID',
    deploymentChannelId: phoneConfig.smsChannelId,
    agentConfigurationId: 'YOUR_AGENT_ID',
    instructionConfigurationId: 'YOUR_INSTRUCTION_ID',
    deploymentName: 'SMS Support Agent',
    isActive: true,
    deploymentStatus: DeploymentStatus.PENDING,
    provisioningType: DeploymentProvisioningType.DIRECT
  });

  console.log('✓ Setup complete!');
  console.log(`\nYour SMS agent is ready!`);
  console.log(`📱 Text: ${phoneConfig.phoneNumber}`);
  console.log(`📋 Deployment ID: ${deployment.id}`);

  return { phoneConfig, deployment };
}

setupSMSChannel().catch(console.error);
```

---

## Message Length Handling

### Standard SMS (160 characters)

Single SMS message supports up to 160 characters.

### Long Messages (Concatenated SMS)

Messages longer than 160 characters are automatically split and reassembled:
- Split into segments of 153 characters
- Delivered as single message to recipient
- Charged per segment

**Example**:
- 200 characters = 2 segments = 2 SMS charges
- 320 characters = 3 segments = 3 SMS charges

### Agent Configuration for SMS

Optimize your agent for concise SMS responses:

```typescript
const agentConfig = await client.agentConfigs.create({
  agentName: 'SMS Support Agent',
  temperature: 0.7,
  maxTokens: 150, // Keep responses under 160 characters
  // Configure agent to be concise
});
```

**Best Practice**: Configure instructions to keep responses under 160 characters for cost optimization.

---

## Multi-Language SMS Support

Configure your agent to support multiple languages:

```typescript
// In your Agent Configuration
const agentConfig = await client.agentConfigs.create({
  agentName: 'Multilingual SMS Agent',
  language: 'en-US', // Default language
  // Agent will auto-detect and respond in sender's language
});
```

**Supported Languages**:
- English (US, UK)
- Spanish (ES, MX)
- French (FR, CA)
- German (DE)
- Italian (IT)
- Portuguese (BR, PT)
- And more...

**Note**: Character encoding may affect message length for non-English languages.

---

## Compliance and Regulations

### US Regulations

**10DLC Registration Required**:
- Local numbers (non-toll-free) require 10DLC registration
- Registration is automatic for verified businesses
- Unregistered numbers have lower throughput

**A2P Trust Score**:
- Affects message delivery rates
- Based on: business verification, message content, user engagement
- Higher scores = better deliverability

### TCPA Compliance

Ensure compliance with Telephone Consumer Protection Act:

1. ✅ Obtain explicit opt-in consent
2. ✅ Provide clear opt-out instructions
3. ✅ Honor opt-out requests immediately
4. ✅ Keep consent records

**Opt-Out Example**:
```
"Reply STOP to unsubscribe"
```

### GDPR Compliance (EU)

For European customers:

1. ✅ Obtain clear consent
2. ✅ Provide data access rights
3. ✅ Allow data deletion
4. ✅ Secure data storage

---

## Toll-Free SMS

Use toll-free numbers for verified business messaging.

### Purchase Toll-Free Number

```typescript
const phonePurchase = await client.phoneConfigs.purchase({
  friendlyName: 'Business SMS Line',
  phoneNumber: '+18005551234',
  providerType: ProviderType.SIGNALWIRE,
  numberType: PhoneNumberType.TOLL_FREE
});
```

**Benefits**:
- Higher throughput (3 msg/sec vs 1 msg/sec)
- Better for high-volume messaging
- Professional appearance
- No 10DLC registration needed

**Verification Required**:
- Toll-free verification through carrier
- Submit business info and use case
- Processing time: 5-10 business days

---

## Troubleshooting

### Messages not delivering
1. ✅ Verify phone purchase completed (`status: ACTIVE`)
2. ✅ Check deployment is active (`isActive: true`)
3. ✅ Ensure `smsChannelId` is correct
4. ✅ Verify phone number has SMS capability enabled
5. ✅ Check account has sufficient credits
6. ✅ Review carrier filtering (spam detection)

### Delayed message delivery
1. ✅ Check carrier throughput limits
2. ✅ Verify 10DLC registration status
3. ✅ Review A2P trust score
4. ✅ Contact support for carrier status

### Agent not responding
1. ✅ Verify Agent Configuration is valid
2. ✅ Check Instruction Configuration exists
3. ✅ Review message logs in WIIL Console
4. ✅ Test with simple message first

### Messages marked as spam
1. ✅ Complete 10DLC registration
2. ✅ Improve A2P trust score
3. ✅ Avoid spam trigger words
4. ✅ Include opt-out instructions
5. ✅ Monitor user engagement

---

## Providers

### SignalWire (Recommended)

```typescript
providerType: ProviderType.SIGNALWIRE
```

**Benefits**:
- High deliverability
- Competitive pricing
- Advanced features
- Excellent support

### Twilio

```typescript
providerType: ProviderType.TWILIO
```

**Benefits**:
- Global coverage
- Established provider
- Wide number selection
- Strong deliverability

---

## Next Steps

- **Voice**: [Voice Channels Guide](./voice-channels.md)
- **Management**: [Channel Management](./channel-management.md)
- **Troubleshooting**: [Troubleshooting Guide](./troubleshooting.md)
- **Phone Purchase**: [Phone Purchase Guide](./phone-purchase.md)

---

[← Back to Channels Home](./README.md)
