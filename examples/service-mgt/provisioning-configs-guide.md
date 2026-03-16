# Provisioning Configurations Guide

This guide covers creating and managing provisioning configurations using the WIIL Platform JS SDK. Provisioning configurations define voice processing chains (STT -> Processing -> TTS) and translation configurations for AI deployments.

## Quick Start

```typescript
import { WiilClient } from 'wiil-js';
import { SupportedProprietor } from 'wiil-core-js';

const client = new WiilClient({
  apiKey: 'your-api-key'
});

const chain = await client.provisioningConfigs.create({
  chainName: 'customer-support-voice-chain',
  description: 'Voice processing chain for customer support',
  sttConfig: {
    providerType: SupportedProprietor.DEEPGRAM,
    providerModelId: 'nova-2',
    languageId: 'en-US'
  },
  processingConfig: {
    providerType: SupportedProprietor.OPENAI,
    providerModelId: 'gpt-4o-mini'
  },
  ttsConfig: {
    providerType: SupportedProprietor.ELEVENLABS,
    providerModelId: 'eleven_turbo_v2',
    languageId: 'en-US',
    voiceId: 'voice_rachel'
  }
});

console.log('Chain created:', chain.id);
```

## Architecture Overview

Provisioning configurations define **voice processing chains**:

- **STT Config**: Speech-to-Text configuration for converting voice input to text
- **Processing Config**: The LLM model that processes the text
- **TTS Config**: Text-to-Speech configuration for converting responses to voice

**Use Cases:**
- Phone-based AI assistants
- Voice-enabled web applications
- Real-time translation services

## Provisioning Chain Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| chainName | string | Yes | Unique name for the chain |
| description | string | No | Description of the chain's purpose |
| sttConfig | DynamicSTTModelConfiguration | Yes | Speech-to-Text configuration |
| processingConfig | DynamicModelConfiguration | Yes | Text processing model configuration |
| ttsConfig | DynamicTTSModelConfiguration | Yes | Text-to-Speech configuration |

### STT Config Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| providerType | SupportedProprietor | Yes | Provider (e.g., 'Deepgram', 'OpenAI') |
| providerModelId | string | Yes | Provider-specific model ID (e.g., 'nova-2') |
| languageId | string | No | Language code (default: 'en') |

### Processing Config Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| providerType | SupportedProprietor | Yes | Provider (e.g., 'OpenAI', 'Anthropic') |
| providerModelId | string | Yes | Provider-specific model ID (e.g., 'gpt-4o-mini') |

### TTS Config Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| providerType | SupportedProprietor | Yes | Provider (e.g., 'ElevenLabs', 'OpenAI') |
| providerModelId | string | Yes | Provider-specific model ID (e.g., 'eleven_multilingual_v2') |
| languageId | string | No | Language code (default: 'en') |
| voiceId | string | No | Voice ID from the TTS model's supported voices |

## CRUD Operations

### Create Provisioning Configuration

```typescript
const chain = await client.provisioningConfigs.create({
  chainName: 'voice-support-chain',
  description: 'Voice processing for customer support',
  sttConfig: {
    providerType: SupportedProprietor.DEEPGRAM,
    providerModelId: 'nova-2',
    languageId: 'en-US'
  },
  processingConfig: {
    providerType: SupportedProprietor.OPENAI,
    providerModelId: 'gpt-4o-mini'
  },
  ttsConfig: {
    providerType: SupportedProprietor.ELEVENLABS,
    providerModelId: 'eleven_turbo_v2',
    languageId: 'en-US',
    voiceId: 'voice_rachel'
  }
});

console.log('Chain created:', chain.id);
console.log('Chain name:', chain.chainName);
```

### Create Translation Configuration

```typescript
const translationChain = await client.provisioningConfigs.createTranslation({
  chainName: 'english-spanish-translation',
  description: 'Real-time English to Spanish translation',
  sttConfig: {
    providerType: SupportedProprietor.DEEPGRAM,
    providerModelId: 'nova-2',
    languageId: 'en',
  },
  processingConfig: {
    providerType: SupportedProprietor.OPENAI,
    providerModelId: 'gpt-4o-mini',
  },
  ttsConfig: {
    providerType: SupportedProprietor.ELEVENLABS,
    providerModelId: 'eleven_multilingual_v2',
    languageId: 'es',
    voiceId: 'spanish-voice-id',
  },
  isTranslation: true,
});

console.log('Translation chain created:', translationChain.id);
```

### Get Provisioning Configuration

```typescript
// Get by ID
const chain = await client.provisioningConfigs.get('chain_123');
console.log('Chain name:', chain.chainName);

// Get by chain name
const byName = await client.provisioningConfigs.getByChainName('voice-support-chain');
console.log('Found chain:', byName.id);
```

### List Provisioning Configurations

```typescript
// List all configurations
const all = await client.provisioningConfigs.list({
  page: 1,
  pageSize: 20,
});

console.log('Total configs:', all.meta.totalCount);

// List only provisioning chains (STT -> Processing -> TTS)
const provisioningChains = await client.provisioningConfigs.listProvisioningChains();
console.log('Provisioning chains:', provisioningChains.data.length);

// List only translation chains
const translationChains = await client.provisioningConfigs.listTranslationChains();
console.log('Translation chains:', translationChains.data.length);
```

### Update Provisioning Configuration

```typescript
const updated = await client.provisioningConfigs.update({
  id: 'chain_123',
  description: 'Updated voice processing chain',
  chainName: 'updated-voice-chain',
  // Optionally update model configurations
  processingConfig: {
    providerType: SupportedProprietor.OPENAI,
    providerModelId: 'gpt-4.1-mini',
  },
});

console.log('Updated chain:', updated.chainName);
```

### Delete Provisioning Configuration

```typescript
const deleted = await client.provisioningConfigs.delete('chain_123');

if (deleted) {
  console.log('Chain deleted successfully');
}
```

## Full Example with Voice

```typescript
import { WiilClient } from 'wiil-js';
import { SupportedProprietor } from 'wiil-core-js';

const client = new WiilClient({
  apiKey: process.env.WIIL_API_KEY!
});

const chain = await client.provisioningConfigs.create({
  // Required
  chainName: 'customer-support-voice-chain',

  // Optional - Description
  description: 'Voice processing chain for customer support calls',

  // Required - STT Configuration
  sttConfig: {
    providerType: SupportedProprietor.DEEPGRAM,
    providerModelId: 'nova-2',
    languageId: 'en-US'
  },

  // Required - Processing Configuration
  processingConfig: {
    providerType: SupportedProprietor.OPENAI,
    providerModelId: 'gpt-4o-mini'
  },

  // Required - TTS Configuration
  ttsConfig: {
    providerType: SupportedProprietor.ELEVENLABS,
    providerModelId: 'eleven_turbo_v2',
    languageId: 'en-US',
    voiceId: 'voice_rachel'
  }
});

console.log('Chain created:', chain.id);
console.log('Chain name:', chain.chainName);
```

---

## Voice Configuration

### Overview

Provisioning chains require Speech-to-Text (STT), Processing, and Text-to-Speech (TTS) configurations to define the complete voice processing pipeline.

### STT Configuration

```typescript
sttConfig: {
  providerType: SupportedProprietor.DEEPGRAM,  // Required
  providerModelId: 'nova-2',                    // Required
  languageId: 'en-US'                           // Optional, default: 'en'
}
```

### Processing Configuration

```typescript
processingConfig: {
  providerType: SupportedProprietor.OPENAI,    // Required
  providerModelId: 'gpt-4o-mini'               // Required
}
```

### TTS Configuration

```typescript
ttsConfig: {
  providerType: SupportedProprietor.ELEVENLABS, // Required
  providerModelId: 'eleven_turbo_v2',           // Required
  languageId: 'en-US',                          // Optional, default: 'en'
  voiceId: 'voice_rachel'                       // Optional
}
```

### Supported Providers

```typescript
import { SupportedProprietor } from 'wiil-core-js';

// Available providers
SupportedProprietor.OPENAI      // "OpenAI"
SupportedProprietor.GOOGLE      // "Google"
SupportedProprietor.ANTHROPIC   // "Anthropic"
SupportedProprietor.GROQ        // "Groq"
SupportedProprietor.DEEPGRAM    // "Deepgram" - Recommended for STT
SupportedProprietor.ELEVENLABS  // "ElevenLabs" - Recommended for TTS
SupportedProprietor.CARTESIA    // "Cartesia"
```

### Recommended Configurations

**For STT (Speech-to-Text):**

```typescript
sttConfig: {
  providerType: SupportedProprietor.DEEPGRAM,
  providerModelId: 'nova-2',
  languageId: 'en-US'
}
```

**For Processing (LLM):**

```typescript
processingConfig: {
  providerType: SupportedProprietor.OPENAI,
  providerModelId: 'gpt-4o-mini'
}
```

**For TTS (Text-to-Speech):**

```typescript
ttsConfig: {
  providerType: SupportedProprietor.ELEVENLABS,
  providerModelId: 'eleven_turbo_v2',
  languageId: 'en-US',
  voiceId: 'voice_rachel'
}
```

---

## Complete Lifecycle Example

Full workflow demonstrating provisioning configuration lifecycle with dynamic model discovery:

```typescript
import { WiilClient } from 'wiil-js';
import { LLMType, SupportedProprietor } from 'wiil-core-js';

const client = new WiilClient({
  apiKey: process.env.WIIL_API_KEY!
});

async function createVoiceProcessingChain() {
  // 1. Discover available models from support registry
  console.log('Fetching available models...');
  const models = await client.supportModels.list();

  const sttModel = models.find(m =>
    m.type === LLMType.STT &&
    !m.discontinued &&
    m.supportLanguages?.length > 0
  );

  const processingModel = models.find(m =>
    m.type === LLMType.TEXT_PROCESSING &&
    !m.discontinued
  );

  const ttsModel = models.find(m =>
    m.type === LLMType.TTS &&
    !m.discontinued &&
    m.supportedVoices?.length > 0 &&
    m.supportLanguages?.length > 0
  );

  if (!sttModel || !processingModel || !ttsModel) {
    throw new Error('Required models not available');
  }

  console.log('Using STT:', `${sttModel.proprietor}/${sttModel.provider_model_id}`);
  console.log('Using Processing:', `${processingModel.proprietor}/${processingModel.provider_model_id}`);
  console.log('Using TTS:', `${ttsModel.proprietor}/${ttsModel.provider_model_id}`);

  // 2. Get default language and voice
  const sttLang = sttModel.supportLanguages!.find(l => l.isDefault) || sttModel.supportLanguages![0];
  const ttsLang = ttsModel.supportLanguages!.find(l => l.isDefault) || ttsModel.supportLanguages![0];
  const voice = ttsModel.supportedVoices!.find(v => v.isDefault) || ttsModel.supportedVoices![0];

  // 3. Create provisioning chain
  const chain = await client.provisioningConfigs.create({
    chainName: `voice-chain-${Date.now()}`,
    description: 'Voice processing chain for phone support',
    sttConfig: {
      providerType: sttModel.proprietor as SupportedProprietor,
      providerModelId: sttModel.provider_model_id!,
      languageId: sttLang.languageId
    },
    processingConfig: {
      providerType: processingModel.proprietor as SupportedProprietor,
      providerModelId: processingModel.provider_model_id!
    },
    ttsConfig: {
      providerType: ttsModel.proprietor as SupportedProprietor,
      providerModelId: ttsModel.provider_model_id!,
      languageId: ttsLang.languageId,
      voiceId: voice.voiceId
    }
  });
  console.log('Chain created:', chain.id);

  // 4. Retrieve and verify
  const retrieved = await client.provisioningConfigs.get(chain.id);
  console.log('Retrieved chain:', retrieved.chainName);

  // 5. List all provisioning chains
  const allChains = await client.provisioningConfigs.listProvisioningChains();
  console.log('Total provisioning chains:', allChains.meta.totalCount);

  // 6. Update the chain
  const updated = await client.provisioningConfigs.update({
    id: chain.id,
    description: 'Updated voice processing chain'
  });
  console.log('Updated chain description');

  // 7. Clean up
  await client.provisioningConfigs.delete(chain.id);
  console.log('Chain deleted');

  console.log('Complete!');
}

createVoiceProcessingChain().catch(console.error);
```

## Best Practices

1. **Verify model availability** - Always check that STT, Processing, and TTS models are available and not discontinued before creating chains.

2. **Use valid provider/model combinations** - The `providerType` and `providerModelId` must match entries in the support models registry.

3. **Use compatible voice IDs** - The voiceId must come from the TTS model's `supportedVoices` array.

4. **Match languages** - Ensure the STT and TTS configurations use compatible language codes.

5. **Use descriptive chain names** - Chain names should clearly indicate the purpose (e.g., 'customer-support-voice-en').

6. **Validate models before use** - The SDK validates models against the support registry before creating chains.

## Troubleshooting

### Unsupported Model

**Error:**
```
WiilValidationError: Unsupported STT model: Deepgram/invalid-model. Please verify the model is available in the support registry.
```

**Solution:**
Verify the model exists in the support registry:

```typescript
const models = await client.supportModels.list();
const sttModels = models.filter(m => m.type === LLMType.STT && !m.discontinued);

console.log('Available STT models:');
sttModels.forEach(m => {
  console.log(`  ${m.proprietor}/${m.provider_model_id}: ${m.name}`);
});
```

### Invalid Voice ID

**Error:**
```
WiilValidationError: Voice ID not found for TTS model
```

**Solution:**
Use a voice ID from the TTS model's supported voices:

```typescript
const ttsModel = models.find(m =>
  m.type === LLMType.TTS &&
  m.supportedVoices?.length > 0
);

if (ttsModel?.supportedVoices) {
  console.log('Available voices:');
  ttsModel.supportedVoices.forEach(v => {
    console.log(`  ${v.voiceId}: ${v.name} (default: ${v.isDefault})`);
  });
}
```

### Chain Name Already Exists

**Error:**
```
WiilAPIError: Chain name already exists
```

**Solution:**
Use unique chain names or check existing chains first:

```typescript
try {
  const existing = await client.provisioningConfigs.getByChainName('my-chain');
  console.log('Chain already exists:', existing.id);
} catch (error) {
  // Chain doesn't exist, safe to create
  const chain = await client.provisioningConfigs.create({
    chainName: 'my-chain',
    // ...
  });
}
```

### Missing Required Configuration

**Error:**
```
WiilValidationError: processingConfig is required
```

**Solution:**
Ensure all required configurations are provided:

```typescript
const chain = await client.provisioningConfigs.create({
  chainName: 'my-chain',
  sttConfig: {
    providerType: SupportedProprietor.DEEPGRAM,
    providerModelId: 'nova-2',
  },
  processingConfig: {  // Required!
    providerType: SupportedProprietor.OPENAI,
    providerModelId: 'gpt-4o-mini',
  },
  ttsConfig: {
    providerType: SupportedProprietor.ELEVENLABS,
    providerModelId: 'eleven_multilingual_v2',
  },
});
```
