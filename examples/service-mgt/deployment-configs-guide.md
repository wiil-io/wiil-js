# Deployment Configuration Guide

This guide covers creating and managing deployment configurations using the WIIL Platform JS SDK. Deployment configurations are the central composition entity that brings together agents, instructions, channels, and projects to create complete AI deployments.

## Quick Start

```typescript
import { WiilClient, DeploymentType, BusinessSupportServices } from 'wiil-js';

const client = new WiilClient({
  apiKey: 'your-api-key',
});

// Assuming you have already created:
// - A project
// - An instruction configuration
// - An agent configuration
// - A deployment channel

const deployment = await client.deploymentConfigs.create({
  projectId: 'proj_123',
  deploymentChannelId: 'channel_456',
  agentConfigurationId: 'agent_789',
  instructionConfigurationId: 'instr_abc',
  deploymentName: 'Customer Support Deployment',
});

console.log('Deployment created:', deployment.id);
```

## Architecture Overview

Deployment configurations are the **central composition entity** in the WIIL platform:

- **Brings Together**: Agent Configuration + Instruction Configuration + Deployment Channel + Project
- **1:1 with Channel**: Each deployment has exactly one channel
- **N:1 Relationships**: Multiple deployments can share agents, instructions, and projects
- **Multi-Channel Pattern**: Create separate deployments for each channel to expose an agent through multiple channels

**Provisioning Types:**
- **DIRECT**: Agent processes interactions directly
- **CHAINED**: Uses provisioning chain (STT -> Agent -> TTS) for voice processing

## Enums

### DeploymentStatus

```typescript
enum DeploymentStatus {
  PENDING = 'pending',   // Created but not yet activated
  ACTIVE = 'active',     // Operational and accepting interactions
  PAUSED = 'paused',     // Temporarily suspended
  ARCHIVED = 'archived'  // Decommissioned
}
```

### DeploymentProvisioningType

```typescript
enum DeploymentProvisioningType {
  DIRECT = 'direct',   // Direct agent processing
  CHAINED = 'chained'  // Provisioning chain (STT -> Agent -> TTS)
}
```

## Deployment Configuration Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| projectId | string | Yes | Project this deployment belongs to |
| deploymentChannelId | string | Yes | Deployment channel ID (1:1 relationship) |
| agentConfigurationId | string | Yes | Agent configuration ID (N:1 relationship) |
| instructionConfigurationId | string | Yes | Instruction configuration ID (N:1 relationship) |
| deploymentName | string | No | Human-readable name |
| deploymentStatus | DeploymentStatus | Auto | Current status (defaults to PENDING) |
| provisioningType | DeploymentProvisioningType | No | Processing type (default: DIRECT) |
| provisioningConfigChainId | string | No | Chain ID (required for CHAINED type) |
| isActive | boolean | No | Whether accepting interactions (default: false) |

## CRUD Operations

### Create Deployment Configuration

```typescript
// Get or create prerequisites
const model = await client.supportModels.getDefaultMultiMode();

const instruction = await client.instructionConfigs.create({
  instructionName: 'Support Instructions',
  role: 'Support Agent',
  introductionMessage: 'Hello!',
  instructions: 'You are a helpful support agent.',
  guardrails: 'Be professional.',
  supportedServices: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
});

const agent = await client.agentConfigs.create({
  name: 'SupportBot',
  modelId: model!.modelId,
  instructionConfigurationId: instruction.id,
});

const channel = await client.deploymentChannels.create({
  channelIdentifier: 'https://support.example.com',
  deploymentType: DeploymentType.WEB,
  channelName: 'Support Chat',
  recordingEnabled: true,
  configuration: { communicationType: 'unified' },
});

// Get project
const projects = await client.projects.list();
const projectId = projects.data[0].id;

// Create deployment
const deployment = await client.deploymentConfigs.create({
  projectId: projectId,
  deploymentChannelId: channel.id,
  agentConfigurationId: agent.id,
  instructionConfigurationId: instruction.id,
  deploymentName: 'Customer Support',
});

console.log('Deployment created:', deployment.id);
console.log('Status:', deployment.deploymentStatus);
```

### Create Chained Deployment

For voice deployments with STT/TTS processing:

```typescript
const chainedDeployment = await client.deploymentConfigs.createChain({
  projectId: 'proj_123',
  deploymentChannelId: 'channel_456',
  agentConfigurationId: 'agent_789',
  instructionConfigurationId: 'instr_abc',
  provisioningConfigChainId: 'chain_xyz',
  deploymentName: 'Voice Support Line',
});
```

### Get Deployment Configuration

```typescript
// Get by ID
const deployment = await client.deploymentConfigs.get('deploy_123');
console.log('Deployment name:', deployment.deploymentName);
console.log('Status:', deployment.deploymentStatus);
console.log('Active:', deployment.isActive);

// Get by channel ID
const byChannel = await client.deploymentConfigs.getByChannel('channel_456');
console.log('Deployment for channel:', byChannel.id);
```

### List Deployment Configurations

```typescript
// List all deployments
const result = await client.deploymentConfigs.list({
  page: 1,
  pageSize: 20,
});

console.log('Total deployments:', result.meta.totalCount);
result.data.forEach(d => {
  console.log(`- ${d.deploymentName} (${d.deploymentStatus})`);
});

// List by project
const projectDeployments = await client.deploymentConfigs.listByProject('proj_123');
console.log('Project deployments:', projectDeployments.data.length);

// List by agent
const agentDeployments = await client.deploymentConfigs.listByAgent('agent_789');
console.log('Agent deployments:', agentDeployments.data.length);

// List by instruction
const instrDeployments = await client.deploymentConfigs.listByInstruction('instr_abc');
console.log('Instruction deployments:', instrDeployments.data.length);
```

### Update Deployment Configuration

```typescript
const updated = await client.deploymentConfigs.update({
  id: 'deploy_123',
  deploymentName: 'Updated Support Deployment',
  isActive: true,
});

console.log('Updated name:', updated.deploymentName);
console.log('Now active:', updated.isActive);
```

### Delete Deployment Configuration

```typescript
const deleted = await client.deploymentConfigs.delete('deploy_123');

if (deleted) {
  console.log('Deployment deleted successfully');
}
```

## Complete Example

Full workflow demonstrating deployment configuration lifecycle:

```typescript
import { WiilClient, DeploymentType, BusinessSupportServices } from 'wiil-js';

const client = new WiilClient({
  apiKey: process.env.WIIL_API_KEY!,
});

async function createFullDeployment() {
  // 1. Get model
  const model = await client.supportModels.getDefaultMultiMode();
  if (!model) throw new Error('No model available');
  console.log('Using model:', model.modelId);

  // 2. Get or create project
  const projects = await client.projects.list();
  let projectId: string;

  if (projects.data.length > 0) {
    projectId = projects.data[0].id;
  } else {
    const project = await client.projects.create({
      name: 'Test Project',
      description: 'Integration test project',
    });
    projectId = project.id;
  }
  console.log('Using project:', projectId);

  // 3. Create instruction configuration
  const instruction = await client.instructionConfigs.create({
    instructionName: `Deployment_Test_Instructions_${Date.now()}`,
    role: 'Deployment Test Agent',
    introductionMessage: 'Hello! I am a test deployment agent.',
    instructions: 'You are a helpful assistant for deployment testing.',
    guardrails: 'Follow all safety guidelines.',
    supportedServices: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
  });
  console.log('Instruction created:', instruction.id);

  // 4. Create agent configuration
  const agent = await client.agentConfigs.create({
    name: 'DeployTestAgent',
    modelId: model.modelId,
    instructionConfigurationId: instruction.id,
    metadata: { test: true },
  });
  console.log('Agent created:', agent.id);

  // 5. Create deployment channel
  const channel = await client.deploymentChannels.create({
    channelIdentifier: `https://test-deploy-${Date.now()}.example.com`,
    deploymentType: DeploymentType.WEB,
    channelName: 'Test Deployment Channel',
    recordingEnabled: true,
    configuration: { communicationType: 'unified' },
  });
  console.log('Channel created:', channel.id);

  // 6. Create deployment configuration
  const deployment = await client.deploymentConfigs.create({
    projectId: projectId,
    deploymentChannelId: channel.id,
    agentConfigurationId: agent.id,
    instructionConfigurationId: instruction.id,
    deploymentName: `Test_Deployment_${Date.now()}`,
  });
  console.log('Deployment created:', deployment.id);
  console.log('Status:', deployment.deploymentStatus);

  // 7. Retrieve deployment
  const retrieved = await client.deploymentConfigs.get(deployment.id);
  console.log('Retrieved deployment:', retrieved.deploymentName);

  // 8. List deployments by project
  const projectDeployments = await client.deploymentConfigs.listByProject(projectId);
  console.log('Project has', projectDeployments.data.length, 'deployments');

  // 9. Update deployment
  const updated = await client.deploymentConfigs.update({
    id: deployment.id,
    deploymentName: 'Updated_Test_Deployment',
  });
  console.log('Updated name:', updated.deploymentName);

  // 10. Clean up (in reverse order of dependencies)
  await client.deploymentConfigs.delete(deployment.id);
  console.log('Deployment deleted');

  await client.deploymentChannels.delete(channel.id);
  console.log('Channel deleted');

  await client.agentConfigs.delete(agent.id);
  console.log('Agent deleted');

  await client.instructionConfigs.delete(instruction.id);
  console.log('Instruction deleted');

  console.log('Cleanup complete!');
}

createFullDeployment().catch(console.error);
```

## Best Practices

1. **Create resources in order** - Follow the dependency chain: Project -> Instruction -> Agent -> Channel -> Deployment

2. **Delete in reverse order** - When cleaning up, delete deployments first, then channels, agents, and instructions

3. **Use meaningful deployment names** - Names help identify deployments in administrative interfaces

4. **Keep isActive false initially** - Start with deployments inactive, then activate after verification

5. **Use listByX methods for filtering** - Use `listByProject()`, `listByAgent()`, or `listByInstruction()` for efficient filtering

6. **One channel per deployment** - Remember the 1:1 relationship. Multi-channel requires multiple deployments.

## Troubleshooting

### Missing Required References

**Error:**
```
WiilValidationError: agentConfigurationId is required
```

**Solution:**
Ensure all required IDs are provided and valid:

```typescript
// Verify all IDs exist before creating deployment
const agent = await client.agentConfigs.get(agentId);
const instruction = await client.instructionConfigs.get(instructionId);
const channel = await client.deploymentChannels.get(channelId);

const deployment = await client.deploymentConfigs.create({
  projectId: projectId,
  deploymentChannelId: channel.id,
  agentConfigurationId: agent.id,
  instructionConfigurationId: instruction.id,
});
```

### Channel Already in Use

**Error:**
```
WiilAPIError: Deployment channel is already associated with another deployment
```

**Solution:**
Each channel can only be used by one deployment. Create a new channel or remove the existing deployment:

```typescript
// Check if channel is in use
try {
  const existing = await client.deploymentConfigs.getByChannel(channelId);
  console.log('Channel already used by deployment:', existing.id);
  // Either use a different channel or delete the existing deployment
} catch (error) {
  // Channel is available
  const deployment = await client.deploymentConfigs.create({
    deploymentChannelId: channelId,
    // ...
  });
}
```

### Cannot Delete Deployment

**Error:**
```
WiilAPIError: Cannot delete active deployment
```

**Solution:**
Deactivate the deployment before deleting:

```typescript
// First deactivate
await client.deploymentConfigs.update({
  id: deploymentId,
  isActive: false,
});

// Then delete
await client.deploymentConfigs.delete(deploymentId);
```

### Invalid Provisioning Type

**Error:**
```
WiilValidationError: provisioningConfigChainId is required for CHAINED provisioning type
```

**Solution:**
Use `createChain()` for chained deployments or provide the chain ID:

```typescript
// Option 1: Use createChain method
const deployment = await client.deploymentConfigs.createChain({
  // ... other fields
  provisioningConfigChainId: 'chain_123',
});

// Option 2: Stick with DIRECT provisioning (default)
const deployment = await client.deploymentConfigs.create({
  // provisioningType defaults to DIRECT, no chain needed
  // ...
});
```
