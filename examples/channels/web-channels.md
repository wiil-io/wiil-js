# Web Chat Widget Guide

**Set up browser-based chat for your website**

**Setup Time**: ~2 minutes

---

## Overview

Web channels enable AI agents to interact with customers through a chat widget embedded on your website. Supports text chat, voice, or both.

**Key Features**:
- ✅ Text chat with rich media
- ✅ Voice conversations (WebRTC)
- ✅ Customizable theming
- ✅ Mobile responsive
- ✅ Real-time messaging

---

## Quick Start

### Step 1: Create Web Channel

```typescript
import { WiilClient, DeploymentType, OttCommunicationType } from 'wiil-js';

const client = new WiilClient({ apiKey: process.env.WIIL_API_KEY! });

const webChannel = await client.deploymentChannels.create({
  deploymentType: DeploymentType.WEB,
  channelName: 'Website Live Chat',
  channelIdentifier: 'https://example.com',
  recordingEnabled: true,
  configuration: {
    communicationType: OttCommunicationType.UNIFIED,
    widgetConfiguration: {
      position: 'right'
    }
  }
});

console.log(`Channel ID: ${webChannel.id}`);
```

### Step 2: Create Deployment

```typescript
import { DeploymentStatus, DeploymentProvisioningType } from 'wiil-js';

const deployment = await client.deploymentConfigs.create({
  projectId: 'YOUR_PROJECT_ID',
  deploymentChannelId: webChannel.id,
  agentConfigurationId: 'YOUR_AGENT_ID',
  instructionConfigurationId: 'YOUR_INSTRUCTION_ID',
  deploymentName: 'Website Chat',
  isActive: true,
  deploymentStatus: DeploymentStatus.PENDING,
  provisioningType: DeploymentProvisioningType.DIRECT
});

console.log(`Deployment ID: ${deployment.id}`);
```

### Step 3: Add Widget to Website

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome!</h1>

  <!-- WIIL Widget -->
  <div
    id="wiil-widget"
    data-config-id="YOUR_DEPLOYMENT_ID"
    data-features="chat,voice"
  ></div>
  <script src="https://cdn.wiil.io/public/wiil-widget.js"></script>
  <script>WiilWidget.init();</script>
</body>
</html>
```

**That's it!** Your chat widget is now live.

---

## Communication Types

Choose how customers interact:

### TEXT - Text Chat Only

```typescript
communicationType: OttCommunicationType.TEXT
```

**Features**:
- Text messages
- Rich media (images, files)
- Typing indicators
- Message history

**Best for**: Help centers, FAQ bots, support chat

### VOICE - Voice Only

```typescript
communicationType: OttCommunicationType.VOICE
```

**Features**:
- Voice input/output
- Speech recognition
- Real-time audio (WebRTC)

**Best for**: Voice-first applications, accessibility

### UNIFIED - Text + Voice

```typescript
communicationType: OttCommunicationType.UNIFIED
```

**Features**:
- All text features
- All voice features
- Seamless switching
- Multi-modal conversations

**Best for**: Full-featured customer service (recommended)

---

## Widget Configuration

### Position

Control where the widget appears:

```typescript
widgetConfiguration: {
  position: 'right'  // or 'left'
}
```

---

## Complete Example

```typescript
import {
  WiilClient,
  DeploymentType,
  OttCommunicationType,
  DeploymentStatus,
  DeploymentProvisioningType
} from 'wiil-js';

async function setupWebChat() {
  const client = new WiilClient({ apiKey: process.env.WIIL_API_KEY! });

  // Get prerequisites
  const project = await client.projects.getDefault();
  const agentConfig = await client.agentConfigs.get('YOUR_AGENT_ID');
  const instructionConfig = await client.instructionConfigs.get('YOUR_INSTRUCTION_ID');

  // Create web channel with custom theme
  const webChannel = await client.deploymentChannels.create({
    deploymentType: DeploymentType.WEB,
    channelName: 'E-commerce Support Chat',
    channelIdentifier: 'https://shop.example.com',
    recordingEnabled: true,
    configuration: {
      communicationType: OttCommunicationType.UNIFIED,
      widgetConfiguration: {
        position: 'right'
      }
    }
  });

  // Create deployment
  const deployment = await client.deploymentConfigs.create({
    projectId: project.id,
    deploymentChannelId: webChannel.id,
    agentConfigurationId: agentConfig.id,
    instructionConfigurationId: instructionConfig.id,
    deploymentName: 'E-commerce Support',
    isActive: true,
    deploymentStatus: DeploymentStatus.PENDING,
    provisioningType: DeploymentProvisioningType.DIRECT
  });

  console.log('✓ Setup complete!');
  console.log(`\nAdd this to your website:\n`);
  console.log(`<div id="wiil-widget" data-config-id="${deployment.id}" data-features="chat,voice"></div>`);
  console.log(`<script src="https://cdn.wiil.io/public/wiil-widget.js"></script>`);
  console.log(`<script>WiilWidget.init();</script>`);

  return { webChannel, deployment };
}

setupWebChat().catch(console.error);
```

---

## React Integration

```tsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Create widget container
    const widgetDiv = document.createElement('div');
    widgetDiv.id = 'wiil-widget';
    widgetDiv.setAttribute('data-config-id', 'YOUR_DEPLOYMENT_ID');
    widgetDiv.setAttribute('data-features', 'chat,voice');
    document.body.appendChild(widgetDiv);

    // Load widget script
    const script = document.createElement('script');
    script.src = 'https://cdn.wiil.io/public/wiil-widget.js';
    script.async = true;
    script.onload = () => {
      window.WiilWidget.init();
    };
    document.body.appendChild(script);

    // Cleanup
    return () => {
      document.body.removeChild(widgetDiv);
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="App">
      <h1>My App</h1>
    </div>
  );
}
```

---

## Environment-Specific Setup

Use different URLs for dev/staging/production:

```typescript
const channelIdentifier = process.env.NODE_ENV === 'production'
  ? 'https://example.com'
  : process.env.NODE_ENV === 'staging'
  ? 'https://staging.example.com'
  : 'http://localhost:3000';

const webChannel = await client.deploymentChannels.create({
  deploymentType: DeploymentType.WEB,
  channelIdentifier,
  // ... rest of config
});
```

---

## Widget Data Attributes

| Attribute | Required | Description | Example |
|-----------|----------|-------------|---------|
| `id` | ✅ Yes | Must be "wiil-widget" | `id="wiil-widget"` |
| `data-config-id` | ✅ Yes | Deployment ID | `data-config-id="abc123"` |
| `data-features` | ✅ Yes | Features to enable | `data-features="chat,voice"` |

**Feature Options**:
- `"chat"` - Text chat only
- `"voice"` - Voice only
- `"chat,voice"` - Both (recommended)

---

## Troubleshooting

### Widget not appearing
1. ✅ Verify deployment ID is correct
2. ✅ Check deployment `isActive: true`
3. ✅ Ensure script URL is correct
4. ✅ Check browser console for errors
5. ✅ Clear browser cache

### Voice not working
1. ✅ Set `communicationType: UNIFIED` or `VOICE`
2. ✅ Check browser microphone permissions
3. ✅ Use HTTPS (required for microphone access)
4. ✅ Test in supported browser (Chrome, Firefox, Safari)

---

## Next Steps

- **Customize Further**: [Widget Customization Guide](./widget-customization.md)
- **Manage Channels**: [Channel Management](./channel-management.md)

---

[← Back to Channels Home](./README.md)
