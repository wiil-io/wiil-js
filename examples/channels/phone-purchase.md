# Phone Number Purchase Guide

**How to purchase phone numbers for voice and SMS channels**

---

## Overview

Purchasing a phone number automatically creates **two channels**:
1. **Voice Channel** (CALLS) - For phone calls
2. **SMS Channel** (SMS) - For text messaging

**Processing Time**: Under 5 minutes

---

## Prerequisites

Before purchasing:

1. ✅ Active WIIL Platform account
2. ✅ Sufficient account credits
3. ✅ Project ID for organization
4. ✅ SDK installed and initialized

---

## Finding Available Phone Numbers

Before purchasing, search for available phone numbers from your telephony provider.

### Get Available Regions

```typescript
import { WiilClient } from 'wiil-js';
import { ProviderType } from 'wiil-core-js';

const client = new WiilClient({
  apiKey: process.env.WIIL_API_KEY!
});

// Get available regions for SignalWire
const regions = await client.telephonyProvider.getRegions(ProviderType.SIGNALWIRE);

console.log(`Found ${regions.length} regions`);
regions.forEach(region => {
  console.log(`- ${region.regionName} (${region.regionId})`);
});
```

### Search for Phone Numbers

```typescript
// Get all available phone numbers in the region
const numbers = await client.telephonyProvider.getPhoneNumbers(
  ProviderType.SIGNALWIRE,
  'US'
);

console.log(`Found ${numbers.length} available numbers`);
numbers.forEach(number => {
  console.log(`${number.phoneNumber} - ${number.friendlyName}`);
});
```

---

## Step-by-Step Purchase

### Step 1: Initialize Client

```typescript
import { WiilClient } from 'wiil-js';

const client = new WiilClient({
  apiKey: process.env.WIIL_API_KEY!
});
```

### Step 2: Submit Purchase Request

```typescript
import {
  ProviderType,
  PhoneNumberType,
  PhonePurchaseStatus
} from 'wiil-js';

const phonePurchase = await client.phoneConfigs.purchase({
  friendlyName: 'Customer Support Line',
  phoneNumber: '+12125551234',
  providerType: ProviderType.SIGNALWIRE,
  numberType: PhoneNumberType.LOCAL
});

console.log('Purchase submitted!');
console.log(`Phone: ${phonePurchase.phoneNumber}`);
console.log(`Status: ${phonePurchase.status}`);
console.log(`Purchase ID: ${phonePurchase.id}`);
```

**Output**:
```
Purchase submitted!
Phone: +12125551234
Status: PENDING
Purchase ID: 9x8y7z6w5v4u3t2s1r0q
```

### Step 3: Wait for Completion

Phone purchases process in **under 5 minutes**. The status changes from `PENDING` to `COMPLETED`.

#### Option A: Poll for Status

```typescript
async function waitForPurchaseCompletion(purchaseId: string) {
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes (5s intervals)

  while (attempts < maxAttempts) {
    const purchase = await client.phoneConfigs.getByRequestId(purchaseId);

    if (purchase.status === PhonePurchaseStatus.COMPLETED) {
      console.log('✓ Purchase completed!');
      return purchase;
    }

    if (purchase.status === PhonePurchaseStatus.FAILED) {
      throw new Error(`Purchase failed: ${purchase.statusDetails}`);
    }

    console.log(`Waiting... (${attempts * 5}s elapsed)`);
    await new Promise(resolve => setTimeout(resolve, 5000));
    attempts++;
  }

  throw new Error('Purchase timeout');
}

await waitForPurchaseCompletion(phonePurchase.id);
```

### Step 4: Retrieve Phone Configuration

Once completed, get the phone configuration with auto-created channel IDs:

```typescript
const phoneConfig = await client.phoneConfigs.getByPhoneNumber('+12125551234');

console.log('Phone Configuration:');
console.log(`  Phone: ${phoneConfig.phoneNumber}`);
console.log(`  Status: ${phoneConfig.status}`);
console.log(`  Provider: ${phoneConfig.providerType}`);
console.log(`  Voice Channel: ${phoneConfig.voiceChannelId}`);
console.log(`  SMS Channel: ${phoneConfig.smsChannelId}`);
```

**Output**:
```
Phone Configuration:
  Phone: +12125551234
  Status: ACTIVE
  Provider: SIGNALWIRE
  Voice Channel: 2s3t4u5v6w7x8y9z0a1b
  SMS Channel: 3t4u5v6w7x8y9z0a1b2c
```

**Important**: Save these channel IDs - you'll need them to create deployments.

---

## Purchase Request Schema

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `phoneNumber` | string | Phone number in E.164 format | "+12125551234" |
| `friendlyName` | string | Human-readable display name | "Support Line" |
| `providerType` | enum | Telephony provider | `ProviderType.SIGNALWIRE` |

### Optional Fields (with defaults)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `numberType` | enum | `PhoneNumberType.LOCAL` | Type of phone number (LOCAL, TOLL_FREE) |

---

## Provider Types

```typescript
enum ProviderType {
  SIGNALWIRE = 'SIGNALWIRE',
  TWILIO = 'TWILIO',
  VONAGE = 'VONAGE'
}
```

**Recommended**: `ProviderType.SIGNALWIRE`

---

## Number Types

```typescript
enum PhoneNumberType {
  LOCAL = 'LOCAL',           // Geographic numbers (e.g., +1-212-xxx-xxxx)
  TOLL_FREE = 'TOLL_FREE'    // 1-800 numbers
}
```

**Most Common**: `PhoneNumberType.LOCAL`

---

## Purchase Status

```typescript
enum PhonePurchaseStatus {
  PENDING = 'PENDING',       // Processing
  COMPLETED = 'COMPLETED',   // Success
  FAILED = 'FAILED',         // Error
  CANCELLED = 'CANCELLED'    // Cancelled
}
```

---

## Complete Example

```typescript
import {
  WiilClient,
  ProviderType,
  PhoneNumberType,
  PhonePurchaseStatus
} from 'wiil-js';

async function purchasePhoneNumber() {
  const client = new WiilClient({ apiKey: process.env.WIIL_API_KEY! });

  // Submit purchase
  const purchase = await client.phoneConfigs.purchase({
    friendlyName: 'Customer Support Line',
    phoneNumber: '+12125551234',
    providerType: ProviderType.SIGNALWIRE,
    numberType: PhoneNumberType.LOCAL
  });

  console.log(`Purchase ID: ${purchase.id}`);
  console.log('Waiting for completion (under 5 minutes)...');

  // Wait for completion
  await new Promise(resolve => setTimeout(resolve, 300000)); // 5 minutes

  // Get phone configuration
  const phoneConfig = await client.phoneConfigs.getByPhoneNumber('+12125551234');

  console.log('✓ Purchase complete!');
  console.log(`Voice Channel ID: ${phoneConfig.voiceChannelId}`);
  console.log(`SMS Channel ID: ${phoneConfig.smsChannelId}`);

  return phoneConfig;
}

purchasePhoneNumber().catch(console.error);
```

---

## Troubleshooting

### Error: "Phone number not available"
**Solution**: The number is already taken. Try a different number.

### Error: "Insufficient credits"
**Solution**: Add credits to your account in WIIL Console.

### Purchase stuck in PENDING
**Solution**:
- Wait up to 5 minutes
- Check purchase status with `getByRequestId()`
- Contact support if exceeds 5 minutes

### Invalid phone number format
**Solution**: Ensure E.164 format: `+[country code][number]`
- ✅ Correct: `+12125551234`
- ❌ Wrong: `2125551234`, `(212) 555-1234`

---

## Next Steps

After purchasing:

1. **Voice Calls**: [Voice Channels Guide](./voice-channels.md)
2. **SMS**: [SMS Channels Guide](./sms-channels.md)
3. **Management**: [Channel Management](./channel-management.md)

---

[← Back to Channels Home](./README.md)
