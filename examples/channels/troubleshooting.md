# Channels Troubleshooting Guide

**Common issues and solutions for deployment channels**

---

## Quick Diagnostics

Run these checks first when experiencing issues:

```typescript
import { WiilClient } from 'wiil-js';

const client = new WiilClient({ apiKey: process.env.WIIL_API_KEY! });

async function diagnoseChannel(channelId: string) {
  console.log('Running diagnostics...\n');

  // 1. Check channel exists
  try {
    const channel = await client.deploymentChannels.get(channelId);
    console.log('✓ Channel exists');
    console.log(`  Name: ${channel.channelName}`);
    console.log(`  Type: ${channel.deploymentType}`);
    console.log(`  Identifier: ${channel.channelIdentifier}`);
  } catch (error) {
    console.log('✗ Channel not found');
    return;
  }

  // 2. Check deployments
  const deployments = await client.deploymentConfigs.list();
  const activeDeployments = deployments.data.filter(
    d => d.deploymentChannelId === channelId && d.isActive
  );

  if (activeDeployments.length === 0) {
    console.log('⚠ No active deployments using this channel');
  } else {
    console.log(`✓ ${activeDeployments.length} active deployment(s)`);
  }

  // 3. Check recording
  const channel = await client.deploymentChannels.get(channelId);
  console.log(`Recording: ${channel.recordingEnabled ? '✓ Enabled' : '⚠ Disabled'}`);

  console.log('\nDiagnostics complete');
}

// Run diagnostics
await diagnoseChannel('YOUR_CHANNEL_ID');
```

---

## Phone Purchase Issues

### Purchase Stuck in PENDING

**Symptoms**: Phone purchase status remains PENDING after 5+ minutes

**Causes**:
- Payment processing delay
- Provider API issues
- Number no longer available
- Account verification pending

**Solutions**:

1. **Check purchase status**:
```typescript
const purchase = await client.phoneConfigs.getByRequestId('9x8y7z6w5v4u3t2s1r0q');
console.log(`Status: ${purchase.status}`);
console.log(`Details: ${purchase.statusDetails}`);
```

2. **Wait longer**: Some purchases take up to 10 minutes

3. **Check account credits**:
```typescript
// Verify sufficient balance in WIIL Console
```

4. **Contact support** if stuck after 15 minutes:
   - Email: dev-support@wiil.io
   - Include: Purchase ID, phone number, timestamp

### Purchase Failed

**Symptoms**: Status changes to FAILED

**Common Reasons**:
```typescript
const purchase = await client.phoneConfigs.getByRequestId('9x8y7z6w5v4u3t2s1r0q');

// Check failure reason
console.log(`Status: ${purchase.status}`);
console.log(`Reason: ${purchase.statusDetails}`);
```

**Solutions by Error**:

| Error Message | Solution |
|--------------|----------|
| "Number not available" | Try different number |
| "Invalid phone number" | Use E.164 format (+12125551234) |
| "Provider error" | Try different provider |
| "Region not supported" | Choose supported region |

### Wrong Phone Number Format

**Symptoms**: Purchase fails with "Invalid phone number"

**Problem**: Not using E.164 format

**Solution**:
```typescript
// ❌ Wrong formats
phoneNumber: '2125551234'
phoneNumber: '(212) 555-1234'
phoneNumber: '+1 (212) 555-1234'

// ✅ Correct format (E.164)
phoneNumber: '+12125551234'
```

---

## Voice Channel Issues

### Calls Not Connecting

**Symptoms**: Calls to phone number fail or don't reach agent

**Diagnostic Steps**:

1. **Verify phone purchase completed**:
```typescript
const phoneConfig = await client.phoneConfigs.getByPhoneNumber('+12125551234');
console.log(`Status: ${phoneConfig.status}`); // Should be "ACTIVE"
```

2. **Check voice channel exists**:
```typescript
console.log(`Voice Channel ID: ${phoneConfig.voiceChannelId}`);
if (!phoneConfig.voiceChannelId) {
  console.log('✗ Voice channel not created');
}
```

3. **Verify deployment is active**:
```typescript
const deployments = await client.deploymentConfigs.list();
const voiceDeployment = deployments.data.find(
  d => d.deploymentChannelId === phoneConfig.voiceChannelId
);

if (!voiceDeployment) {
  console.log('✗ No deployment found for voice channel');
} else if (!voiceDeployment.isActive) {
  console.log('✗ Deployment is not active');
} else {
  console.log('✓ Deployment is active');
}
```

4. **Test with simple agent**:
```typescript
// Create minimal test deployment
const testDeployment = await client.deploymentConfigs.create({
  projectId: 'YOUR_PROJECT_ID',
  deploymentChannelId: phoneConfig.voiceChannelId,
  agentConfigurationId: 'SIMPLE_AGENT_ID',
  instructionConfigurationId: 'SIMPLE_INSTRUCTION_ID',
  deploymentName: 'Voice Test',
  isActive: true
});

// Try calling again
```

**Common Fixes**:
- Ensure voice capability enabled during purchase
- Check account credits balance
- Review provider status page

### Poor Call Quality

**Symptoms**: Choppy audio, delays, dropped calls

**Solutions**:

1. **Check network connection**: Test from different network
2. **Verify provider status**: Check SignalWire/Twilio/Vonage status pages
3. **Review call logs**: Check WIIL Console for error patterns
4. **Test different location**: Try from different geographic region
5. **Contact support**: Report with specific call IDs

### Agent Not Responding on Calls

**Symptoms**: Call connects but agent doesn't speak

**Diagnostic Steps**:

1. **Check agent configuration**:
```typescript
const agentConfig = await client.agentConfigs.get('YOUR_AGENT_ID');
console.log(`Voice ID: ${agentConfig.voiceId}`);
console.log(`Language: ${agentConfig.language}`);
```

2. **Verify instruction configuration**:
```typescript
const instructionConfig = await client.instructionConfigs.get('YOUR_INSTRUCTION_ID');
console.log(`Instructions exist: ${!!instructionConfig.systemInstructions}`);
```

3. **Test with minimal instructions**:
```typescript
const testInstructions = await client.instructionConfigs.create({
  instructionName: 'Test Voice',
  systemInstructions: 'You are a helpful assistant. Say hello when someone calls.',
  agentConfigurationId: 'YOUR_AGENT_ID'
});
```

4. **Review call recordings**: Check WIIL Console for actual call flow

---

## SMS Channel Issues

### Messages Not Delivering

**Symptoms**: SMS messages don't reach recipients

**Diagnostic Steps**:

1. **Verify phone purchase completed**:
```typescript
const phoneConfig = await client.phoneConfigs.getByPhoneNumber('+12125551234');
console.log(`Status: ${phoneConfig.status}`); // Should be "ACTIVE"
```

2. **Check SMS channel exists**:
```typescript
console.log(`SMS Channel ID: ${phoneConfig.smsChannelId}`);
if (!phoneConfig.smsChannelId) {
  console.log('✗ SMS channel not created');
}
```

3. **Verify deployment is active**:
```typescript
const deployments = await client.deploymentConfigs.list();
const smsDeployment = deployments.data.find(
  d => d.deploymentChannelId === phoneConfig.smsChannelId
);

console.log(`Active: ${smsDeployment?.isActive}`);
```

4. **Check SMS capability**:
```typescript
// Verify SMS was enabled during purchase
capabilities: {
  voice: true,
  SMS: true  // ← Must be true
}
```

**Common Fixes**:
- Verify SMS capability enabled
- Check account credits
- Review carrier filtering (spam detection)
- Complete 10DLC registration (US numbers)

### Messages Marked as Spam

**Symptoms**: Messages not delivered or flagged as spam

**Causes**:
- Unregistered 10DLC (US local numbers)
- Low A2P trust score
- Spam trigger words
- High volume without verification

**Solutions**:

1. **Complete 10DLC Registration** (US local numbers):
   - Login to WIIL Console
   - Navigate to Phone Numbers
   - Complete business verification
   - Submit use case description

2. **Improve A2P Trust Score**:
   - Use verified business numbers
   - Include opt-out instructions
   - Avoid spam trigger words
   - Monitor user engagement

3. **Use Toll-Free Numbers**:
```typescript
// Toll-free numbers have higher deliverability
numberType: PhoneNumberType.TOLL_FREE
phoneNumber: '+18005551234'
```

4. **Follow Best Practices**:
   - Always get opt-in consent
   - Include "Reply STOP to unsubscribe"
   - Avoid ALL CAPS
   - Don't use excessive punctuation!!!
   - Keep messages concise

### Delayed Message Delivery

**Symptoms**: Messages arrive minutes or hours late

**Causes**:
- Carrier throttling
- High volume exceeding throughput limits
- 10DLC registration pending

**Solutions**:

1. **Check throughput limits**:
   - Local numbers: 1 msg/sec (unregistered) or 3 msg/sec (registered)
   - Toll-free: 3 msg/sec

2. **Complete 10DLC registration**: Increases throughput

3. **Use toll-free numbers**: Higher throughput

4. **Distribute across multiple numbers**: For high volume

---

## Web Channel Issues

### Widget Not Appearing

**Symptoms**: Chat widget doesn't show on website

**Diagnostic Steps**:

1. **Check HTML integration**:
```html
<!-- ✓ Verify this exists in your HTML -->
<div id="wiil-widget" data-config-id="YOUR_DEPLOYMENT_ID" data-features="chat,voice"></div>
<script src="https://cdn.wiil.io/public/wiil-widget.js"></script>
<script>WiilWidget.init();</script>
```

2. **Verify deployment ID**:
```typescript
const deployment = await client.deploymentConfigs.get('YOUR_DEPLOYMENT_ID');
console.log(`Active: ${deployment.isActive}`);
console.log(`Channel ID: ${deployment.deploymentChannelId}`);
```

3. **Check browser console**: Look for JavaScript errors

4. **Clear browser cache**: Force reload (Ctrl+Shift+R or Cmd+Shift+R)

5. **Test in incognito mode**: Rule out browser extensions

**Common Fixes**:
- Ensure `id="wiil-widget"` (exact spelling)
- Use deployment config ID, not channel ID
- Verify script URL is correct
- Check for Content Security Policy (CSP) restrictions

### Voice Not Working in Widget

**Symptoms**: Voice button doesn't work in web widget

**Diagnostic Steps**:

1. **Check communication type**:
```typescript
const channel = await client.deploymentChannels.get('YOUR_CHANNEL_ID');
console.log(`Communication: ${channel.configuration.communicationType}`);

// Must be VOICE or UNIFIED
if (channel.configuration.communicationType === 'TEXT') {
  console.log('✗ Voice not enabled - communication type is TEXT');
}
```

2. **Verify HTTPS**: Microphone access requires HTTPS
```
✓ https://example.com
✗ http://example.com
```

3. **Check browser permissions**: Microphone must be allowed

4. **Test in supported browser**:
   - ✅ Chrome
   - ✅ Firefox
   - ✅ Safari
   - ⚠️ Internet Explorer (not supported)

**Solution**: Update communication type:
```typescript
await client.deploymentChannels.update({
  id: 'YOUR_CHANNEL_ID',
  configuration: {
    communicationType: OttCommunicationType.UNIFIED,  // ← Enable voice
    widgetConfiguration: {
      position: 'right'
    }
  }
});
```

---

## Deployment Configuration Issues

### Deployment Not Active

**Symptoms**: Agent not responding on any channel

**Diagnostic**:
```typescript
const deployment = await client.deploymentConfigs.get('YOUR_DEPLOYMENT_ID');
console.log(`Active: ${deployment.isActive}`);
console.log(`Status: ${deployment.deploymentStatus}`);
```

**Solution**: Activate deployment:
```typescript
await client.deploymentConfigs.update({
  id: 'YOUR_DEPLOYMENT_ID',
  isActive: true
});
```

### Invalid Agent/Instruction Configuration

**Symptoms**: Deployment fails or agent behaves unexpectedly

**Diagnostic**:
```typescript
const deployment = await client.deploymentConfigs.get('YOUR_DEPLOYMENT_ID');

// Check agent config
try {
  const agentConfig = await client.agentConfigs.get(deployment.agentConfigurationId);
  console.log('✓ Agent config valid');
} catch (error) {
  console.log('✗ Agent config not found');
}

// Check instruction config
try {
  const instructionConfig = await client.instructionConfigs.get(deployment.instructionConfigurationId);
  console.log('✓ Instruction config valid');
} catch (error) {
  console.log('✗ Instruction config not found');
}
```

**Solution**: Update with valid configuration IDs:
```typescript
await client.deploymentConfigs.update({
  id: 'YOUR_DEPLOYMENT_ID',
  agentConfigurationId: 'VALID_AGENT_ID',
  instructionConfigurationId: 'VALID_INSTRUCTION_ID'
});
```

---

## Account and Credits Issues

### API Rate Limiting

**Symptoms**: Requests fail with 429 error

**Solution**:
```typescript
// Implement retry with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000;
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

// Usage
await retryWithBackoff(() => client.deploymentChannels.create({ ... }));
```

---

## General Troubleshooting Steps

### 1. Verify API Key

```typescript
// Test API key validity
try {
  const projects = await client.projects.list();
  console.log('✓ API key valid');
} catch (error) {
  console.log('✗ API key invalid or expired');
}
```

### 2. Check Network Connection

```typescript
// Test connectivity
try {
  await client.deploymentChannels.list({ pageSize: 1 });
  console.log('✓ Network connection OK');
} catch (error) {
  console.log('✗ Network connection failed');
}
```

### 3. Review Error Messages

```typescript
try {
  // Operation
} catch (error) {
  console.log('Error details:');
  console.log(`  Status: ${error.status}`);
  console.log(`  Message: ${error.message}`);
  console.log(`  Details: ${JSON.stringify(error.details, null, 2)}`);
}
```

### 4. Check WIIL Console

Login to WIIL Console to:
- View channel status
- Review call/message logs
- Check recordings
- Monitor usage
- View error logs

### 5. Enable Debug Logging

```typescript
// Enable detailed logging
const client = new WiilClient({
  apiKey: process.env.WIIL_API_KEY!,
  debug: true  // Enable debug output
});
```

---

## Getting Help

### Before Contacting Support

Gather this information:

1. **Channel/Deployment IDs**
2. **Error messages** (complete error logs)
3. **Timestamps** (when issue occurred)
4. **Steps to reproduce**
5. **Expected vs actual behavior**

### Contact Support

**Email**: dev-support@wiil.io

**Include**:
- Account ID
- Channel/Deployment IDs
- Complete error messages
- Steps to reproduce
- What you've already tried

**Response Time**:
- Critical issues: 2 hours
- High priority: 4 hours
- Normal: 24 hours

### Community Resources

- **Documentation**: https://docs.wiil.io
- **API Reference**: https://docs.wiil.io/developer/api-reference
- **Status Page**: https://status.wiil.io

---

## Prevention Checklist

Before deploying to production:

- [ ] Test all channels thoroughly
- [ ] Verify deployments are active
- [ ] Enable recording for monitoring
- [ ] Set up monitoring alerts
- [ ] Complete 10DLC registration (SMS)
- [ ] Test from multiple locations/carriers
- [ ] Review agent instructions
- [ ] Check account credit balance
- [ ] Set up backup/failover channels
- [ ] Document configuration
- [ ] Train team on common issues

---

## Next Steps

- **Voice Channels**: [Voice Channels Guide](./voice-channels.md)
- **SMS Channels**: [SMS Channels Guide](./sms-channels.md)
- **Web Channels**: [Web Channels Guide](./web-channels.md)
- **Management**: [Channel Management](./channel-management.md)

---

[← Back to Channels Home](./README.md)
