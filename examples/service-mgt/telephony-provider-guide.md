# Telephony Provider Guide

This guide covers accessing telephony provider services using the WIIL Platform JS SDK. The telephony provider resource allows you to discover available phone numbers, check pricing, and purchase phone numbers for AI deployments.

## Quick Start

```typescript
import { WiilClient } from 'wiil-js';

const client = new WiilClient({
  apiKey: 'your-api-key',
});

// Get available phone numbers
const numbers = await client.telephonyProvider.getPhoneNumbers();

console.log('Available numbers:', numbers.length);
numbers.forEach(num => {
  console.log(`- ${num.phoneNumber} (${num.friendlyName})`);
});
```

## Architecture Overview

The telephony provider resource provides:

- **Phone Number Discovery**: Search for available phone numbers by area code, region, or capabilities
- **Pricing Information**: Get current pricing for different phone number types
- **Phone Number Purchase**: Acquire phone numbers for use in call/SMS deployments
- **Purchase Status Tracking**: Monitor the status of phone number purchases

## Phone Number Search Options

| Field | Type | Description |
|-------|------|-------------|
| areaCode | string | Area code filter (e.g., '206', '415') |
| contains | string | Number pattern to search for |
| postalCode | string | Postal code filter |

## Operations

### Get Available Phone Numbers

```typescript
// Get all available numbers
const numbers = await client.telephonyProvider.getPhoneNumbers();

console.log('Found', numbers.length, 'available phone numbers');

numbers.forEach(num => {
  console.log(`${num.phoneNumber}:`);
  console.log(`  Friendly Name: ${num.friendlyName}`);
  console.log(`  Capabilities: ${num.capabilities?.join(', ')}`);
});
```

### Filter Phone Numbers by Area Code

```typescript
const numbers = await client.telephonyProvider.getPhoneNumbers({
  areaCode: '206',
});

console.log('Seattle area numbers:', numbers.length);
numbers.forEach(num => {
  console.log(`- ${num.phoneNumber}`);
});
```

### Filter by Pattern (Contains)

```typescript
const numbers = await client.telephonyProvider.getPhoneNumbers({
  contains: '555',
});

console.log('Numbers containing 555:', numbers.length);
```

### Filter by Postal Code

```typescript
const numbers = await client.telephonyProvider.getPhoneNumbers({
  postalCode: '98101',
});

console.log('Numbers in postal code 98101:', numbers.length);
```

### Get Pricing Information

```typescript
const pricing = await client.telephonyProvider.getPricing();

console.log('Phone number pricing:');
pricing.forEach(price => {
  console.log(`  ${price.number_type}: $${price.price}`);
});
```

### Purchase a Phone Number

```typescript
// Search for available numbers
const numbers = await client.telephonyProvider.getPhoneNumbers({
  areaCode: '415',
});

if (numbers.length === 0) {
  throw new Error('No numbers available in this area');
}

// Purchase the first available number
const purchase = await client.telephonyProvider.purchase({
  phoneNumber: numbers[0].phoneNumber,
  friendlyName: 'Customer Support Line',
});

console.log('Purchase initiated:');
console.log('  Phone Number:', purchase.phoneNumber);
console.log('  Purchase ID:', purchase.id);
console.log('  Status:', purchase.status);
```

### Check Purchase Status

```typescript
// The purchase() method automatically polls until completion
// But you can also manually check status:

const status = await client.telephonyProvider.getPurchaseStatus('purchase_123');

console.log('Purchase Status:');
console.log('  ID:', status.id);
console.log('  Phone Number:', status.phoneNumber);
console.log('  Status:', status.status);
```

## Phone Purchase Status Values

```typescript
enum PhonePurchaseStatus {
  PENDING = 'pending',       // Purchase initiated
  PROCESSING = 'processing', // Being processed by provider
  COMPLETED = 'completed',   // Successfully purchased
  FAILED = 'failed',         // Purchase failed
  CANCELLED = 'cancelled'    // Purchase cancelled
}
```

## Complete Example

```typescript
import { WiilClient, PhonePurchaseStatus } from 'wiil-js';

const client = new WiilClient({
  apiKey: process.env.WIIL_API_KEY!,
});

async function exploreTelephonyProvider() {
  // 1. Get pricing information
  console.log('Fetching pricing information...');
  const pricing = await client.telephonyProvider.getPricing();

  console.log('\nPhone number pricing:');
  pricing.forEach(p => {
    console.log(`  ${p.number_type}: $${p.price}`);
  });

  // 2. Search for available numbers
  console.log('\nSearching for available phone numbers...');
  const numbers = await client.telephonyProvider.getPhoneNumbers();

  console.log(`Found ${numbers.length} available numbers`);

  if (numbers.length === 0) {
    console.log('No numbers available');
    return;
  }

  // Display first 5 numbers
  console.log('\nFirst 5 available numbers:');
  numbers.slice(0, 5).forEach(num => {
    console.log(`  ${num.phoneNumber} - ${num.friendlyName}`);
  });

  // 3. Search with area code filter
  console.log('\nSearching for 206 area code numbers...');
  const seattleNumbers = await client.telephonyProvider.getPhoneNumbers({
    areaCode: '206',
  });

  console.log(`Found ${seattleNumbers.length} numbers in 206 area code`);

  // 4. Example purchase (commented out to prevent actual purchases)
  /*
  console.log('\nPurchasing phone number...');
  const purchase = await client.telephonyProvider.purchase({
    phoneNumber: numbers[0].phoneNumber,
    friendlyName: 'Test Support Line',
  });

  console.log('Purchase result:');
  console.log('  ID:', purchase.id);
  console.log('  Number:', purchase.phoneNumber);
  console.log('  Status:', purchase.status);

  if (purchase.status === PhonePurchaseStatus.COMPLETED) {
    console.log('Phone number successfully purchased!');
  }
  */
}

exploreTelephonyProvider().catch(console.error);
```

## Best Practices

1. **Check availability before purchasing** - Always search for available numbers first and select from the results.

2. **Use area codes strategically** - Filter by area code to get numbers that match your target audience's location.

3. **Set meaningful friendly names** - Use descriptive friendly names to identify phone numbers in your admin console.

4. **Handle purchase polling** - The `purchase()` method automatically polls until completion. The default timeout is 2 minutes.

5. **Plan for failures** - Phone number purchases can fail due to carrier issues. Always handle the FAILED status gracefully.

## Troubleshooting

### No Numbers Available

**Error:**
```
No phone numbers available
```

**Solution:**
Try different filter criteria or check with a different area code:

```typescript
// Try multiple area codes
const areaCodes = ['206', '415', '212', '310'];

for (const areaCode of areaCodes) {
  const numbers = await client.telephonyProvider.getPhoneNumbers({ areaCode });
  if (numbers.length > 0) {
    console.log(`Found ${numbers.length} numbers in area code ${areaCode}`);
    break;
  }
}
```

### Purchase Timeout

**Error:**
```
Error: Phone number purchase timed out after 120000ms
```

**Solution:**
The purchase is still processing on the provider side. Check the status manually:

```typescript
// If you have the purchase ID, check status
const status = await client.telephonyProvider.getPurchaseStatus(purchaseId);

if (status.status === PhonePurchaseStatus.PROCESSING) {
  console.log('Purchase still processing, please wait...');
} else if (status.status === PhonePurchaseStatus.COMPLETED) {
  console.log('Purchase completed:', status.phoneNumber);
}
```

### Invalid Phone Number Format

**Error:**
```
WiilValidationError: Phone number must be in E.164 format
```

**Solution:**
Ensure phone numbers are in E.164 format (+1XXXXXXXXXX for US numbers):

```typescript
// Always use the phoneNumber value returned from getPhoneNumbers()
const numbers = await client.telephonyProvider.getPhoneNumbers();
const phoneNumber = numbers[0].phoneNumber; // Already in correct format

const purchase = await client.telephonyProvider.purchase({
  phoneNumber: phoneNumber,  // Use as-is
  friendlyName: 'Support Line',
});
```
