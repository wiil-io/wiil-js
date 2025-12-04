# Understanding Deployment Channels

**Learn the fundamentals of deployment channels on the WIIL Platform**

---

## What are Deployment Channels?

**Deployment Channels** define the communication medium through which your AI agent interacts with customers. Think of them as the "phone number" or "website" where conversations happen.

### Key Concepts

#### 1:1 Relationship
- Each Deployment Configuration has **exactly one** Deployment Channel
- One agent deployment = One communication channel

#### Multi-Channel Strategy
To expose an agent across multiple channels:
- Create **separate** Deployment Configurations for each channel
- Reuse the same Agent and Instruction configurations
- Each deployment gets its own channel

### Example Architecture

```
Organization
  └── Project: Customer Support
       ├── Deployment #1: Voice Support
       │    ├── Agent Config (shared)
       │    ├── Instruction Config (shared)
       │    └── Channel: Phone +12125551234 (CALLS)
       │
       ├── Deployment #2: SMS Support
       │    ├── Agent Config (same agent)
       │    ├── Instruction Config (same instructions)
       │    └── Channel: Phone +12125551234 (SMS)
       │
       └── Deployment #3: Web Chat
            ├── Agent Config (same agent)
            ├── Instruction Config (same instructions)
            └── Channel: https://example.com (WEB)
```

---

## Channel Types

### CALLS - Voice Telephony ✅
**Automatic creation** when you purchase a phone number

- **Purpose**: Voice conversations via phone calls
- **Channel Identifier**: Phone number (E.164 format)
- **Setup Time**: ~5 minutes (phone purchase processing)

**Example**:
```typescript
// Phone number: +12125551234
// Channel type: CALLS
// Identifier: "+12125551234"
```

### SMS - Text Messaging ✅
**Automatic creation** when you purchase a phone number

- **Purpose**: Text-based messaging via SMS
- **Channel Identifier**: Phone number (E.164 format)
- **Setup Time**: ~5 minutes (phone purchase processing)

**Example**:
```typescript
// Phone number: +12125551234
// Channel type: SMS
// Identifier: "+12125551234"
```

### WEB - Chat Widget ✅
**Manual creation** via SDK

- **Purpose**: Browser-based chat and voice
- **Channel Identifier**: Website URL
- **Setup Time**: ~2 minutes

**Example**:
```typescript
// Website: https://example.com
// Channel type: WEB
// Identifier: "https://example.com"
```

### MOBILE - Native Apps 🚧
**Coming Soon**

- **Purpose**: iOS and Android app integration
- **Channel Identifier**: App package/bundle ID
- **Status**: In development

---

## Channel Identifier

Each channel has a unique identifier based on its type:

| Channel Type | Identifier Format | Example |
|-------------|-------------------|---------|
| CALLS | E.164 phone number | `+12125551234` |
| SMS | E.164 phone number | `+12125551234` |
| WEB | Website URL | `https://example.com` |
| MOBILE | Package/Bundle ID | `com.example.app` |

---

## Telephony vs Web Channels

### Telephony Channels (CALLS & SMS)

**Automatic Creation**:
- Purchase a phone number → Get 2 channels automatically
- Cannot create CALLS/SMS channels directly
- Managed through PhoneConfiguration

**Workflow**:
```
1. Purchase phone number
   ↓
2. System creates:
   - PhoneConfiguration
   - Voice Channel (CALLS)
   - SMS Channel (SMS)
   ↓
3. Retrieve channel IDs from PhoneConfiguration
   ↓
4. Create deployments using channel IDs
```

### Web Channels

**Manual Creation**:
- Create channel directly via SDK
- Full control over configuration
- Instant availability

**Workflow**:
```
1. Create web channel with SDK
   ↓
2. Get channel ID
   ↓
3. Create deployment using channel ID
   ↓
4. Integrate widget on website
```

---

## Channel Configuration

Each channel type has specific configuration options:

### Phone Channel Config
```typescript
{
  phoneConfigurationId: string,      // Links to PhoneConfiguration
  hasForwardingEnabled: boolean,     // Enable call forwarding
  forwardingPhoneNumber?: string     // Forward destination
}
```

### Web Channel Config
```typescript
{
  communicationType: 'TEXT' | 'VOICE' | 'UNIFIED',
  widgetConfiguration: {
    position: 'left' | 'right'
  }
}
```

---

## Next Steps

Choose your channel type:

- **Voice Calls**: [Phone Purchase Guide](./phone-purchase.md) → [Voice Channels](./voice-channels.md)
- **SMS**: [Phone Purchase Guide](./phone-purchase.md) → [SMS Channels](./sms-channels.md)
- **Web Chat**: [Web Channels Guide](./web-channels.md)

---

[← Back to Channels Home](./README.md)
