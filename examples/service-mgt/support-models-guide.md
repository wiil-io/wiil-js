# Support Models Guide

This guide covers accessing the WIIL Platform Support Model Registry using the JS SDK. The registry maintains a curated list of LLM models from various providers (OpenAI, Anthropic, Google, ElevenLabs, etc.) that are supported by the platform.

## Quick Start

```typescript
import { WiilClient } from 'wiil-js';

const client = new WiilClient({
  apiKey: 'your-api-key',
});

// Get the default multi-mode model for agent configurations
const model = await client.supportModels.getDefaultMultiMode();

console.log('Model ID:', model.modelId);
console.log('Name:', model.name);
console.log('Proprietor:', model.proprietor);
```

## Architecture Overview

The Support Model Registry is a **read-only resource** that provides:

- **Centralized Catalog**: All supported LLM models with their capabilities
- **Model Types**: TEXT, VOICE (TTS), STT, MULTI_MODE, etc.
- **Provider Info**: OpenAI, Anthropic, Google, ElevenLabs, Deepgram, Cartesia
- **Used By**: Agent Configurations reference models via `modelId`

**Key Distinction:**
- `modelId`: WIIL Platform unique identifier (use this in configurations)
- `provider_model_id`: Original ID from the provider's system (e.g., 'gpt-4-1106-preview')

## Enums

### SupportedProprietor

```typescript
enum SupportedProprietor {
  OPENAI = 'OpenAI',
  GOOGLE = 'Google',
  ANTHROPIC = 'Anthropic',
  GROQ = 'Groq',
  DEEPGRAM = 'Deepgram',
  ELEVENLABS = 'ElevenLabs',
  CARTESIA = 'Cartesia'
}
```

### LLMType

```typescript
enum LLMType {
  STS = 'sts',              // Speech-to-speech
  TTS = 'tts',              // Text-to-speech
  STT = 'stt',              // Speech-to-text
  TRANSCRIBE = 'transcribe', // Transcription
  TEXT_PROCESSING = 'text',  // Text processing
  MULTI_MODE = 'multi_mode'  // Multi-modal
}
```

## Support Model Schema

| Field | Type | Description |
|-------|------|-------------|
| modelId | string | WIIL Platform unique model identifier |
| name | string | Human-readable model name |
| proprietor | SupportedProprietor | Model provider (OpenAI, Anthropic, etc.) |
| provider_model_id | string | Original provider model ID |
| description | string | Model capabilities and use cases |
| type | LLMType | Model functionality type |
| discontinued | boolean | Whether model is discontinued |
| supportedVoices | Voice[] | Available voices (for TTS models) |
| supportLanguages | Language[] | Supported languages |

## Operations

### List All Models

```typescript
const models = await client.supportModels.list();

console.log('Available models:', models.length);
models.forEach(model => {
  console.log(`- ${model.name} (${model.proprietor}) - ${model.type}`);
});
```

### Get Model by ID

```typescript
const model = await client.supportModels.get('model_123');

console.log('Model:', model.name);
console.log('Proprietor:', model.proprietor);
console.log('Provider Model ID:', model.provider_model_id);
console.log('Type:', model.type);
console.log('Discontinued:', model.discontinued);
```

### Get Default Models

The registry provides default models for each capability type:

```typescript
// Default multi-mode model (for agent configurations)
const multiMode = await client.supportModels.getDefaultMultiMode();
console.log('Default multi-mode:', multiMode?.name);

// Default Text-to-Speech model
const tts = await client.supportModels.getDefaultTTS();
console.log('Default TTS:', tts?.name);
console.log('Available voices:', tts?.supportedVoices?.length);

// Default Speech-to-Text model
const stt = await client.supportModels.getDefaultSTT();
console.log('Default STT:', stt?.name);
console.log('Supported languages:', stt?.supportLanguages?.length);

// Default Speech-to-Speech model
const sts = await client.supportModels.getDefaultSTS();
console.log('Default STS:', sts?.name);

// Default Transcription model
const transcribe = await client.supportModels.getDefaultTranscribe();
console.log('Default transcription:', transcribe?.name);

// Default Batch processing model
const batch = await client.supportModels.getDefaultBatch();
console.log('Default batch:', batch?.name);

// Default Translation STT model
const translationStt = await client.supportModels.getDefaultTranslationSTT();
console.log('Default translation STT:', translationStt?.name);

// Default Translation TTS model
const translationTts = await client.supportModels.getDefaultTranslationTTS();
console.log('Default translation TTS:', translationTts?.name);
```

### Lookup Models

Find models by type and proprietor or by provider model ID:

```typescript
// Get model by type and proprietor
const textModel = await client.supportModels.getByTypeAndProprietor('TEXT', 'OpenAI');
if (textModel) {
  console.log('Found:', textModel.name);
}

// Get model by proprietor and provider model ID
const specificModel = await client.supportModels.getByProprietorAndProviderModelId(
  'Google',
  'gemini-2.0-flash-exp'
);
if (specificModel) {
  console.log('Wiil Model ID:', specificModel.modelId);
}
```

### Check Model Support

Verify if a specific model is supported:

```typescript
// Check if a model is supported
const isSupported = await client.supportModels.isSupported('OpenAI', 'gpt-4-turbo');
if (isSupported) {
  console.log('Model is supported');
} else {
  console.log('Model is not supported');
}

// Validate models before configuration
const sttSupported = await client.supportModels.isSupported('Deepgram', 'nova-2');
const ttsSupported = await client.supportModels.isSupported('ElevenLabs', 'eleven_turbo_v2');

console.log('STT supported:', sttSupported);
console.log('TTS supported:', ttsSupported);
```

## Complete Example

Full workflow demonstrating support models usage:

```typescript
import { WiilClient, LLMType, SupportedProprietor, BusinessSupportServices } from 'wiil-js';

const client = new WiilClient({
  apiKey: process.env.WIIL_API_KEY!,
});

async function exploreSupportModels() {
  // 1. List all available models
  const allModels = await client.supportModels.list();
  console.log('Total models in registry:', allModels.length);

  // 2. Group models by type
  const modelsByType = allModels.reduce((acc, model) => {
    acc[model.type] = (acc[model.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('Models by type:', modelsByType);

  // 3. Get default model for agent configuration
  const defaultModel = await client.supportModels.getDefaultMultiMode();
  if (!defaultModel) {
    throw new Error('No default multi-mode model available');
  }

  console.log('Using model:', defaultModel.name);
  console.log('Model ID:', defaultModel.modelId);

  // 4. Create instruction configuration
  const instruction = await client.instructionConfigs.create({
    instructionName: 'Demo Agent Instructions',
    role: 'Demo Agent',
    introductionMessage: 'Hello!',
    instructions: 'You are a helpful assistant.',
    guardrails: 'Be professional.',
    supportedServices: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
  });

  // 5. Create agent configuration with the model
  const agent = await client.agentConfigs.create({
    name: 'DemoAgent',
    modelId: defaultModel.modelId,
    instructionConfigurationId: instruction.id,
  });

  console.log('Agent created with model:', agent.modelId);

  // 6. Explore voice models for phone agents
  const ttsModel = await client.supportModels.getDefaultTTS();
  if (ttsModel?.supportedVoices) {
    console.log('Available voices for TTS:');
    ttsModel.supportedVoices.slice(0, 5).forEach(voice => {
      console.log(`  - ${voice.name} (${voice.voiceId})`);
    });
  }

  // 7. Explore STT models for transcription
  const sttModel = await client.supportModels.getDefaultSTT();
  if (sttModel?.supportLanguages) {
    console.log('Supported languages for STT:');
    sttModel.supportLanguages.slice(0, 5).forEach(lang => {
      console.log(`  - ${lang.name} (${lang.code})`);
    });
  }

  // 8. Clean up
  await client.agentConfigs.delete(agent.id);
  await client.instructionConfigs.delete(instruction.id);
  console.log('Cleanup complete');
}

exploreSupportModels().catch(console.error);
```

## Best Practices

1. **Always use `getDefaultMultiMode()` for agent configs** - This returns the recommended model for general agent configurations. Avoid hardcoding model IDs.

2. **Check for null results** - Default model methods return `null` if no model is configured. Always handle this case.

3. **Use `isSupported()` for validation** - Before using a specific provider model ID, verify it's supported by the platform.

4. **Avoid discontinued models** - Check the `discontinued` flag before using a model. Discontinued models are only for legacy support.

5. **Match model type to use case** - Use the appropriate model type for your needs:
   - `MULTI_MODE` for general agents
   - `TTS` for voice synthesis
   - `STT` for speech recognition
   - `TRANSCRIBE` for transcription

## Troubleshooting

### Model Not Found

**Error:**
```
WiilAPIError: Model not found
```

**Solution:**
Verify the model ID is correct by listing all available models:

```typescript
const models = await client.supportModels.list();
const model = models.find(m => m.modelId === 'your-model-id');
if (!model) {
  console.log('Available models:');
  models.forEach(m => console.log(`  ${m.modelId}: ${m.name}`));
}
```

### No Default Model Available

**Error:**
```
TypeError: Cannot read property 'modelId' of null
```

**Solution:**
Always check if the default model exists:

```typescript
const model = await client.supportModels.getDefaultMultiMode();
if (!model) {
  // Fall back to listing and selecting first available
  const models = await client.supportModels.list();
  if (models.length > 0) {
    model = models[0];
  } else {
    throw new Error('No models available in registry');
  }
}
```

### Model is Discontinued

**Warning:** Using a discontinued model may result in degraded service.

**Solution:**
Check the discontinued flag and use an active model:

```typescript
const models = await client.supportModels.list();
const activeModels = models.filter(m => !m.discontinued);

console.log('Active models:', activeModels.length);
activeModels.forEach(m => {
  console.log(`- ${m.name} (${m.proprietor})`);
});
```
