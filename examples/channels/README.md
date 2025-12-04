# Deployment Channels Guides

Welcome to the WIIL Platform Deployment Channels documentation. This directory contains focused guides for each channel type.

## Quick Navigation

### 📚 Core Concepts
- **[Understanding Deployment Channels](./understanding-channels.md)** - What channels are and how they work

### 📞 Telephony Channels
- **[Phone Number Purchase Guide](./phone-purchase.md)** - How to buy phone numbers
- **[Voice Call Channels](./voice-channels.md)** - Setting up call channels
- **[SMS Channels](./sms-channels.md)** - Setting up SMS messaging

### 🌐 Web Channels
- **[Web Chat Widget Guide](./web-channels.md)** - Browser-based chat setup
- **[Widget Customization](./widget-customization.md)** - Theming and styling

### 🔧 Management
- **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions

---

## Quick Start Examples

### Deploy Voice Agent (5 minutes)
```typescript
import { WiilClient, ProviderType, PhoneNumberType } from 'wiil-js';

const client = new WiilClient({ apiKey: process.env.WIIL_API_KEY! });

// 1. Purchase phone number
const purchase = await client.phoneConfigs.purchase({
  friendlyName: 'Support Line',
  phoneNumber: '+12125551234',
  providerType: ProviderType.SIGNALWIRE,
  numberType: PhoneNumberType.LOCAL
});

// 2. Get phone config (after purchase completes ~5 minutes)
const phoneConfig = await client.phoneConfigs.getByPhoneNumber('+12125551234');

// 3. Create deployment
await client.deploymentConfigs.create({
  projectId: 'YOUR_PROJECT_ID',
  deploymentChannelId: phoneConfig.voiceChannelId,
  agentConfigurationId: 'YOUR_AGENT_ID',
  instructionConfigurationId: 'YOUR_INSTRUCTION_ID',
  deploymentName: 'Voice Support',
  isActive: true
});
```

### Deploy Web Chat Agent (2 minutes)
```typescript
import { WiilClient, DeploymentType, OttCommunicationType } from 'wiil-js';

const client = new WiilClient({ apiKey: process.env.WIIL_API_KEY! });

// 1. Create web channel
const webChannel = await client.deploymentChannels.create({
  deploymentType: DeploymentType.WEB,
  channelName: 'Website Chat',
  channelIdentifier: 'https://example.com',
  recordingEnabled: true,
  configuration: {
    communicationType: OttCommunicationType.UNIFIED,
    widgetConfiguration: {
      position: 'right'
    }
  }
});

// 2. Create deployment
const deployment = await client.deploymentConfigs.create({
  projectId: 'YOUR_PROJECT_ID',
  deploymentChannelId: webChannel.id,
  agentConfigurationId: 'YOUR_AGENT_ID',
  instructionConfigurationId: 'YOUR_INSTRUCTION_ID',
  deploymentName: 'Web Chat',
  isActive: true
});

// 3. Add to your website
console.log(`Add this to your HTML:
<div id="wiil-widget" data-config-id="${deployment.id}" data-features="chat,voice"></div>
<script src="https://cdn.wiil.io/public/wiil-widget.js"></script>
<script>WiilWidget.init();</script>
`);
```

---

## Channel Types Overview

| Type | Description | Setup Time | Use Case |
|------|-------------|------------|----------|
| **CALLS** | Voice telephony | ~5 minutes | Phone support, sales calls |
| **SMS** | Text messaging | ~5 minutes | SMS notifications, support |
| **WEB** | Chat widget | ~2 minutes | Website chat, help center |
| **MOBILE** | Native apps | 🚧 Coming Soon | iOS/Android apps |

---

## Support & Resources

- **Documentation**: [https://docs.wiil.io](https://docs.wiil.io)
- **API Reference**: [https://docs.wiil.io/developer/api-reference](https://docs.wiil.io/developer/api-reference)
- **Email Support**: [dev-support@wiil.io](mailto:dev-support@wiil.io)
- **Console**: [https://console.wiil.io](https://console.wiil.io)

---

*Built with ❤️ by the WIIL team*
