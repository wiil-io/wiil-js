# Translation Chain Configuration Guide

This guide covers creating translation chain configurations using the WIIL Platform JS SDK. Translation chains define voice processing pipelines (STT → Processing → TTS) for real-time translation deployments.

## Quick Start

```typescript
import { WiilClient } from 'wiil-js';
import { SupportedProprietor } from 'wiil-core-js';

const client = new WiilClient({
  apiKey: 'your-api-key'
});

const chain = await client.provisioningConfigs.create({
  chainName: 'english-spanish-translation',
  description: 'Real-time English to Spanish translation',
  sttConfig: {
    providerType: SupportedProprietor.DEEPGRAM,
    providerModelId: 'nova-2',
    languageId: 'en-US'
  },
  processingConfig: {
    providerType: SupportedProprietor.OPENAI,
    providerModelId: 'gpt-4o'
  },
  ttsConfig: {
    providerType: SupportedProprietor.ELEVENLABS,
    providerModelId: 'eleven_multilingual_v2',
    languageId: 'es-ES',
    voiceId: 'spanish-voice-id'
  },
  isTranslation: true
});

console.log('Translation chain created:', chain.id);
```

## Architecture Overview

Translation chains define **voice processing pipelines**:

- **STT Config**: Speech-to-Text configuration for converting voice input to text
- **Processing Config**: The LLM model that translates the text
- **TTS Config**: Text-to-Speech configuration for converting translated text to voice

**Use Cases:**
- Real-time translation services
- Multilingual customer support
- Cross-language communication platforms

## Translation Chain Schema

| Field            | Type                          | Required | Description                              |
|------------------|-------------------------------|----------|------------------------------------------|
| chainName        | string                        | Yes      | Unique name for the chain                |
| description      | string                        | No       | Description of the chain's purpose       |
| sttConfig        | DynamicSTTModelConfiguration  | Yes      | Speech-to-Text configuration             |
| processingConfig | DynamicModelConfiguration     | Yes      | Text processing/translation model config |
| ttsConfig        | DynamicTTSModelConfiguration  | Yes      | Text-to-Speech configuration             |
| isTranslation    | boolean                       | Yes      | Must be `true` for translation chains    |

### STT Config Schema

| Field           | Type               | Required | Description                                   |
|-----------------|--------------------|----------|-----------------------------------------------|
| providerType    | SupportedProprietor | Yes      | Provider (e.g., 'Deepgram', 'OpenAI')        |
| providerModelId | string             | Yes      | Provider-specific model ID (e.g., 'nova-2')  |
| languageId      | string             | Yes      | Source language code (e.g., 'en-US')         |

### Processing Config Schema

| Field           | Type               | Required | Description                                    |
|-----------------|--------------------|----------|------------------------------------------------|
| providerType    | SupportedProprietor | Yes      | Provider (e.g., 'OpenAI', 'Anthropic')        |
| providerModelId | string             | Yes      | Provider-specific model ID (e.g., 'gpt-4o')   |

### TTS Config Schema

| Field           | Type               | Required | Description                                        |
|-----------------|--------------------|----------|----------------------------------------------------|
| providerType    | SupportedProprietor | Yes      | Provider (e.g., 'ElevenLabs', 'OpenAI')           |
| providerModelId | string             | Yes      | Provider-specific model ID                         |
| languageId      | string             | Yes      | Target language code (e.g., 'es-ES')              |
| voiceId         | string             | No       | Voice ID from the TTS model's supported voices    |

## Create Translation Chain

```typescript
import { WiilClient } from 'wiil-js';
import { SupportedProprietor } from 'wiil-core-js';

const client = new WiilClient({
  apiKey: process.env.WIIL_API_KEY!
});

const translationChain = await client.provisioningConfigs.create({
  // Required - Unique chain name
  chainName: 'french-english-translation',

  // Optional - Description
  description: 'Real-time French to English translation',

  // Required - STT Configuration (source language)
  sttConfig: {
    providerType: SupportedProprietor.DEEPGRAM,
    providerModelId: 'nova-2',
    languageId: 'fr-FR'
  },

  // Required - Processing Configuration (translation model)
  processingConfig: {
    providerType: SupportedProprietor.OPENAI,
    providerModelId: 'gpt-4o'
  },

  // Required - TTS Configuration (target language)
  ttsConfig: {
    providerType: SupportedProprietor.ELEVENLABS,
    providerModelId: 'eleven_multilingual_v2',
    languageId: 'en-US',
    voiceId: 'voice_rachel'
  },

  // Required - Mark as translation chain
  isTranslation: true
});

console.log('Translation chain created:', translationChain.id);
console.log('Chain name:', translationChain.chainName);
```

## Get Translation Chain

### Get by ID

```typescript
const chain = await client.provisioningConfigs.get('chain_123');

console.log('Chain:', chain.chainName);
console.log('STT Model:', chain.sttConfig.modelId);
console.log('Processing Model:', chain.processingModelId);
console.log('TTS Model:', chain.ttsConfig.modelId);
```

### Get by Chain Name

```typescript
const chain = await client.provisioningConfigs.getByChainName('english-spanish-translation');

console.log('Found chain:', chain.id);
```

## Update Translation Chain

```typescript
const updated = await client.provisioningConfigs.update({
  id: 'chain_123',
  description: 'Updated translation chain description',
  processingConfig: {
    providerType: SupportedProprietor.OPENAI,
    providerModelId: 'gpt-4.1-mini'
  }
});

console.log('Updated chain:', updated.id);
console.log('New description:', updated.description);
```

## Delete Translation Chain

```typescript
const deleted = await client.provisioningConfigs.delete('chain_123');

if (deleted) {
  console.log('Translation chain deleted successfully');
}
```

## List Translation Chains

```typescript
// List all translation chains
const result = await client.provisioningConfigs.list();

console.log('Total chains:', result.meta.totalCount);
result.data.forEach(chain => {
  console.log(`- ${chain.chainName} (${chain.id})`);
});

// With pagination
const pagedResult = await client.provisioningConfigs.list({
  page: 1,
  pageSize: 10
});

console.log(`Page ${pagedResult.meta.page} of ${pagedResult.meta.totalPages}`);
```

## Voice Configuration

### STT Configuration (Source Language)

```typescript
sttConfig: {
  providerType: SupportedProprietor.DEEPGRAM,  // Required
  providerModelId: 'nova-2',                    // Required
  languageId: 'en-US'                           // Required - source language
}
```

### Processing Configuration (Translation Model)

```typescript
processingConfig: {
  providerType: SupportedProprietor.OPENAI,    // Required
  providerModelId: 'gpt-4o'                    // Required
}
```

### TTS Configuration (Target Language)

```typescript
ttsConfig: {
  providerType: SupportedProprietor.ELEVENLABS, // Required
  providerModelId: 'eleven_multilingual_v2',    // Required
  languageId: 'es-ES',                          // Required - target language
  voiceId: 'spanish-voice-id'                   // Optional
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

## Example: Dynamic Model Discovery

Create a translation chain using models discovered from the support registry:

```typescript
import { WiilClient } from 'wiil-js';
import { LLMType, SupportedProprietor } from 'wiil-core-js';

const client = new WiilClient({
  apiKey: process.env.WIIL_API_KEY!
});

async function createTranslationChain(sourceLang: string, targetLang: string) {
  // 1. Discover available models from support registry
  console.log('Fetching available models...');
  const models = await client.supportModels.list();

  const sttModel = models.find(m =>
    m.type === LLMType.STT &&
    !m.discontinued &&
    m.supportLanguages?.some(l => l.languageId === sourceLang)
  );

  const processingModel = models.find(m =>
    m.type === LLMType.TEXT_PROCESSING &&
    !m.discontinued
  );

  const ttsModel = models.find(m =>
    m.type === LLMType.TTS &&
    !m.discontinued &&
    m.supportedVoices?.length > 0 &&
    m.supportLanguages?.some(l => l.languageId === targetLang)
  );

  if (!sttModel || !processingModel || !ttsModel) {
    throw new Error('Required models not available for specified languages');
  }

  console.log('Using STT:', `${sttModel.proprietor}/${sttModel.provider_model_id}`);
  console.log('Using Processing:', `${processingModel.proprietor}/${processingModel.provider_model_id}`);
  console.log('Using TTS:', `${ttsModel.proprietor}/${ttsModel.provider_model_id}`);

  // 2. Get voice for target language
  const voice = ttsModel.supportedVoices!.find(v => v.isDefault) || ttsModel.supportedVoices![0];

  // 3. Create translation chain
  const chain = await client.provisioningConfigs.create({
    chainName: `translation-${sourceLang}-to-${targetLang}-${Date.now()}`,
    description: `Real-time ${sourceLang} to ${targetLang} translation`,
    sttConfig: {
      providerType: sttModel.proprietor as SupportedProprietor,
      providerModelId: sttModel.provider_model_id!,
      languageId: sourceLang
    },
    processingConfig: {
      providerType: processingModel.proprietor as SupportedProprietor,
      providerModelId: processingModel.provider_model_id!
    },
    ttsConfig: {
      providerType: ttsModel.proprietor as SupportedProprietor,
      providerModelId: ttsModel.provider_model_id!,
      languageId: targetLang,
      voiceId: voice.voiceId
    },
    isTranslation: true
  });

  console.log('Translation chain created:', chain.id);
  return chain;
}

// Create English to Spanish translation chain
createTranslationChain('en-US', 'es-ES').catch(console.error);
```

## Best Practices

1. **Verify model availability** - Always check that STT, Processing, and TTS models are available and not discontinued before creating chains.

2. **Use valid provider/model combinations** - The `providerType` and `providerModelId` must match entries in the support models registry.

3. **Use multilingual TTS models** - For translation, use models that support multiple languages (e.g., `eleven_multilingual_v2`).

4. **Match languages correctly** - STT `languageId` should be the source language, TTS `languageId` should be the target language.

5. **Use descriptive chain names** - Chain names should clearly indicate the translation direction (e.g., 'translation-en-to-es').

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

### Missing Required Configuration

**Error:**
```
WiilValidationError: isTranslation is required
```

**Solution:**
Ensure all required fields are provided:

```typescript
const chain = await client.provisioningConfigs.create({
  chainName: 'my-translation-chain',
  sttConfig: {
    providerType: SupportedProprietor.DEEPGRAM,
    providerModelId: 'nova-2',
    languageId: 'en-US',  // Required for translation
  },
  processingConfig: {
    providerType: SupportedProprietor.OPENAI,
    providerModelId: 'gpt-4o',
  },
  ttsConfig: {
    providerType: SupportedProprietor.ELEVENLABS,
    providerModelId: 'eleven_multilingual_v2',
    languageId: 'es-ES',  // Required for translation
  },
  isTranslation: true,  // Required!
});
```
