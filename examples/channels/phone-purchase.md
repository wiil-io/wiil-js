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

Before purchasing, search for available phone numbers.

### Search for Phone Numbers

```typescript
import { WiilClient } from 'wiil-js';

const client = new WiilClient({
  apiKey: process.env.WIIL_API_KEY!
});

// Get all available phone numbers
const numbers = await client.telephonyProvider.getPhoneNumbers();

console.log(`Found ${numbers.length} available numbers`);
numbers.forEach(number => {
  console.log(`${number.phoneNumber} - ${number.friendlyName}`);
});
```

### Search with Filters

```typescript
// Search with area code filter
const seattleNumbers = await client.telephonyProvider.getPhoneNumbers({
  areaCode: '206'
});

// Search with pattern filter
const customNumbers = await client.telephonyProvider.getPhoneNumbers({
  contains: '555',
  postalCode: '98101'
});

seattleNumbers.forEach(number => {
  console.log(`${number.phoneNumber} - ${number.locality}, ${number.region}`);
});
```

### Get Pricing

```typescript
const pricing = await client.telephonyProvider.getPricing();

pricing.forEach(price => {
  console.log(`Number Type: ${price.number_type}`);
  console.log(`Price: $${price.price}`);
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
const phonePurchase = await client.telephonyProvider.purchase({
  phoneNumber: '+12125551234',
  friendlyName: 'Customer Support Line' // Optional
});

console.log('Purchase submitted!');
console.log(`Phone: ${phonePurchase.phoneNumber}`);
console.log(`Status: ${phonePurchase.status}`);
console.log(`Purchase ID: ${phonePurchase.id}`);
```

**Output**:

```text
Purchase submitted!
Phone: +12125551234
Status: PENDING
Purchase ID: 9x8y7z6w5v4u3t2s1r0q
```

### Step 3: Wait for Completion

Phone purchases process in **under 5 minutes**. The status changes from `PENDING` to `COMPLETED`.

#### Option A: Poll for Status

```typescript
import { PhonePurchaseStatus } from 'wiil-core-js';

async function waitForPurchaseCompletion(purchaseId: string) {
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes (5s intervals)

  while (attempts < maxAttempts) {
    const config = await client.phoneConfigs.getByRequestId(purchaseId);

    if (config.status === PhonePurchaseStatus.COMPLETED) {
      console.log('✓ Purchase completed!');
      return config;
    }

    if (config.status === PhonePurchaseStatus.FAILED) {
      throw new Error(`Purchase failed`);
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
console.log(`  Voice Channel: ${phoneConfig.voiceChannelId}`);
console.log(`  SMS Channel: ${phoneConfig.smsChannelId}`);
```

**Output**:

```text
Phone Configuration:
  Phone: +12125551234
  Status: ACTIVE
  Voice Channel: 2s3t4u5v6w7x8y9z0a1b
  SMS Channel: 3t4u5v6w7x8y9z0a1b2c
```

**Important**: Save these channel IDs - you'll need them to create deployments.

---

## Purchase Request Schema

### Required Fields

| Field         | Type   | Description                   | Example          |
|---------------|--------|-------------------------------|------------------|
| `phoneNumber` | string | Phone number in E.164 format  | "+12125551234"   |

### Optional Fields

| Field          | Type   | Description                                        |
|----------------|--------|----------------------------------------------------|
| `friendlyName` | string | Human-readable display name (e.g., "Support Line") |

---

## Search Options

```typescript
interface PhoneNumberSearchOptions {
  areaCode?: string;    // Area code filter (e.g., '206', '415')
  contains?: string;    // Number pattern to search for
  postalCode?: string;  // Postal code filter
}
```

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
import { WiilClient } from 'wiil-js';
import { PhonePurchaseStatus } from 'wiil-core-js';

async function purchasePhoneNumber() {
  const client = new WiilClient({ apiKey: process.env.WIIL_API_KEY! });

  // Search for available numbers
  const availableNumbers = await client.telephonyProvider.getPhoneNumbers({
    areaCode: '212'
  });

  if (availableNumbers.length === 0) {
    throw new Error('No numbers available');
  }

  // Select first available number
  const selectedNumber = availableNumbers[0].phoneNumber;
  console.log(`Selected: ${selectedNumber}`);

  // Submit purchase
  const purchase = await client.telephonyProvider.purchase({
    phoneNumber: selectedNumber,
    friendlyName: 'Customer Support Line'
  });

  console.log(`Purchase ID: ${purchase.id}`);
  console.log('Waiting for completion (under 5 minutes)...');

  // Wait for completion
  await new Promise(resolve => setTimeout(resolve, 300000)); // 5 minutes

  // Get phone configuration
  const phoneConfig = await client.phoneConfigs.getByPhoneNumber(selectedNumber);

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
