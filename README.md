# WIIL JavaScript SDK

Official JavaScript/TypeScript SDK for the [WIIL Platform](https://console.wiil.io) - AI-powered conversational services platform for intelligent customer interactions, voice processing, real-time translation, and business management.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

## Features

- ✅ **Type-Safe** - Full TypeScript support with comprehensive type definitions
- ✅ **Production-Grade** - Built for enterprise use with robust error handling
- ✅ **Validated** - Runtime validation using Zod schemas
- ✅ **Well-Documented** - Comprehensive JSDoc comments and API documentation
- ✅ **Tested** - Extensive test coverage with Vitest
- ✅ **Modern** - ES2023 JavaScript, async/await, Promise-based
- ✅ **Comprehensive** - Access to all WIIL Platform domains

## Installation

```bash
npm install wiil-js
```

```bash
yarn add wiil-js
```

```bash
pnpm add wiil-js
```

## Quick Start

```typescript
import { WiilClient } from 'wiil-js';

// Initialize the client with your API key
const client = new WiilClient({
  apiKey: 'your-api-key'
});

// Get your organization
const organization = await client.organizations.get();
console.log('Organization:', organization.companyName);

// Create a project
const project = await client.projects.create({
  name: 'Production Environment',
  description: 'Main production deployment',
  isDefault: true
});

console.log('Project created:', project.id);
```

## Platform Overview

The WIIL Platform provides comprehensive APIs for building AI-powered conversational services across four integrated domains:

### 1. Service Configuration

Deploy and manage AI agents with customizable behavior:

- **Agent Configurations** - Define AI agent capabilities and characteristics
- **Instruction Configurations** - The heart of agent behavior with prompts, guidelines, and compliance rules
- **Deployment Configurations** - Combine agents and instructions into deployable units
- **Phone Configurations** - Configure telephony settings for voice calls
- **Provisioning Configurations** - Manage provisioning settings

### 2. Advanced Service Configuration

Enable voice-powered conversations with end-to-end processing:

- **Provisioning Chain Configurations** - STT → Agent → TTS voice processing pipelines
- **Speech-to-Text (STT)** - Convert voice to text using Deepgram, OpenAI Whisper, Cartesia
- **Text-to-Speech (TTS)** - Generate natural voice using ElevenLabs, Cartesia, OpenAI
- **Deployment Channels** - Manage OTT Chat, Telephony, SMS, and Email channels

### 3. Translation Services

Real-time multilingual voice translation:

- **Translation Sessions** - Enable live voice-to-voice translation
- **Bidirectional Translation** - Two-way communication between languages
- **Multi-Participant Support** - Sessions with multiple participants, each in their native language
- **Conversation Configurations** - Configure translation session parameters
- **Knowledge Sources** - Manage knowledge bases for translation accuracy

### 4. Business Management

Catalog management and AI-powered transactional operations:

- **Business Services** - Manage bookable services (appointments, consultations)
- **Customers** - Customer information and relationship management
- **Reservable Resources** - Define reservable assets (tables, rooms, equipment)
- **Menus** - Food and beverage catalog management
- **Products** - Retail product catalog management
- **Service Appointments** - AI-powered appointment booking through conversations
- **Reservations** - AI-powered resource reservation through conversations
- **Menu Orders** - AI-powered food/beverage ordering through conversations
- **Product Orders** - AI-powered product ordering through conversations

## Configuration

### Basic Configuration

```typescript
const client = new WiilClient({
  apiKey: 'your-api-key'
});
```

### Advanced Configuration

```typescript
const client = new WiilClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.wiil.io/v1', // Custom base URL
  timeout: 60000 // Request timeout in milliseconds (default: 30000)
});
```

## Usage Examples

### Account Management

#### Organizations

```typescript
// Get your organization (read-only)
const org = await client.organizations.get();
console.log('Organization:', org.companyName);
console.log('Business Vertical:', org.businessVerticalId);
console.log('Service Status:', org.serviceStatus);
```

#### Projects

```typescript
// Create a project
const project = await client.projects.create({
  name: 'Production Environment',
  description: 'Main production deployment',
  isDefault: true
});

// Get a project
const project = await client.projects.get('proj_123');

// Get the default project
const defaultProject = await client.projects.getDefault();

// Update a project
const updated = await client.projects.update({
  id: 'proj_123',
  name: 'Production Environment v2'
});

// Delete a project
const deleted = await client.projects.delete('proj_123');

// List projects with pagination
const projects = await client.projects.list({
  page: 1,
  pageSize: 20,
  sortBy: 'name',
  sortDirection: 'asc'
});
```

### Service Configuration

#### Agent Configurations

```typescript
// Create an agent configuration
const agent = await client.agentConfigs.create({
  name: 'Customer Support Agent',
  description: 'AI agent for customer support'
});

// Get agent configuration
const agent = await client.agentConfigs.get('agent_123');

// Update agent configuration
const updated = await client.agentConfigs.update({
  id: 'agent_123',
  name: 'Updated Agent Name'
});

// Delete agent configuration
await client.agentConfigs.delete('agent_123');

// List agent configurations
const agents = await client.agentConfigs.list({ page: 1, pageSize: 20 });
```

#### Deployment Channels

```typescript
// Create a deployment channel
const channel = await client.deploymentChannels.create({
  name: 'Phone Channel',
  type: 'PHONE'
});

// List channels by type
const phoneChannels = await client.deploymentChannels.listByType('PHONE', {
  page: 1,
  pageSize: 20
});
```

#### Conversation Configurations

```typescript
// Get conversation configuration
const config = await client.conversationConfigs.get('config_123');

// List conversation configurations
const configs = await client.conversationConfigs.list();
```

#### Knowledge Sources

```typescript
// Get knowledge source
const source = await client.knowledgeSources.get('source_123');

// List knowledge sources
const sources = await client.knowledgeSources.list();
```

### Business Management

#### Business Services

```typescript
// Create a business service
const service = await client.businessServices.create({
  name: 'Hair Cut',
  description: '30-minute hair cut service',
  duration: 30,
  price: 50.00
});

// Get service
const service = await client.businessServices.get('service_123');

// List services
const services = await client.businessServices.list();
```

#### Customers

```typescript
// Create a customer
const customer = await client.customers.create({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890'
});

// Get customer
const customer = await client.customers.get('customer_123');

// List customers
const customers = await client.customers.list();
```

#### Menus

```typescript
// Create a menu category
const category = await client.menus.createCategory({
  name: 'Appetizers',
  displayOrder: 1
});

// Create a menu item
const item = await client.menus.createItem({
  categoryId: 'cat_123',
  name: 'Caesar Salad',
  description: 'Fresh romaine lettuce with Caesar dressing',
  price: 12.99
});

// List menu categories
const categories = await client.menus.listCategories();
```

#### Products

```typescript
// Create a product category
const category = await client.products.createCategory({
  name: 'Electronics',
  description: 'Electronic devices and accessories'
});

// Create a product
const product = await client.products.create({
  categoryId: 'cat_123',
  name: 'Wireless Headphones',
  description: 'Premium noise-canceling headphones',
  price: 299.99,
  sku: 'WH-001'
});

// List products
const products = await client.products.list();
```

#### Service Appointments

```typescript
// Create a service appointment
const appointment = await client.serviceAppointments.create({
  customerId: 'customer_123',
  serviceId: 'service_123',
  scheduledDate: '2025-01-15',
  scheduledTime: '14:00',
  notes: 'Customer prefers stylist Jane'
});

// Get appointment
const appointment = await client.serviceAppointments.get('appt_123');

// List appointments
const appointments = await client.serviceAppointments.list();
```

#### Reservations

```typescript
// Create a reservation
const reservation = await client.reservations.create({
  customerId: 'customer_123',
  resourceId: 'resource_123',
  date: '2025-01-15',
  time: '19:00',
  partySize: 4
});

// Get reservation
const reservation = await client.reservations.get('res_123');

// List reservations
const reservations = await client.reservations.list();
```

#### Menu Orders

```typescript
// Create a menu order
const order = await client.menuOrders.create({
  customerId: 'customer_123',
  items: [
    { menuItemId: 'item_123', quantity: 2 },
    { menuItemId: 'item_456', quantity: 1 }
  ],
  orderType: 'DELIVERY'
});

// Get order
const order = await client.menuOrders.get('order_123');

// List orders
const orders = await client.menuOrders.list();
```

#### Product Orders

```typescript
// Create a product order
const order = await client.productOrders.create({
  customerId: 'customer_123',
  items: [
    { productId: 'prod_123', quantity: 1 },
    { productId: 'prod_456', quantity: 2 }
  ],
  shippingAddress: {
    street: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102'
  }
});

// Get order
const order = await client.productOrders.get('order_123');

// List orders
const orders = await client.productOrders.list();
```

#### Reservable Resources

```typescript
// Create a reservable resource
const resource = await client.reservationResources.create({
  name: 'Table 5',
  type: 'TABLE',
  capacity: 4,
  location: 'Main Dining Room'
});

// Get resource
const resource = await client.reservationResources.get('resource_123');

// List resources
const resources = await client.reservationResources.list();
```

## Error Handling

The SDK provides type-safe error classes for different error scenarios:

```typescript
import {
  WiilAPIError,
  WiilValidationError,
  WiilNetworkError,
  WiilConfigurationError
} from 'wiil-js';

try {
  const project = await client.projects.create({
    name: 'My Project'
  });
} catch (error) {
  if (error instanceof WiilValidationError) {
    console.error('Validation failed:', error.message);
    console.error('Details:', error.details);
  } else if (error instanceof WiilAPIError) {
    console.error(`API Error ${error.statusCode}:`, error.message);
    console.error('Error Code:', error.code);
  } else if (error instanceof WiilNetworkError) {
    console.error('Network error:', error.message);
    console.error('Consider retrying the request');
  } else if (error instanceof WiilConfigurationError) {
    console.error('Configuration error:', error.message);
  }
}
```

### Error Types

- **`WiilValidationError`** - Thrown when request validation fails (invalid input data)
- **`WiilAPIError`** - Thrown when the API returns an error (4xx, 5xx responses)
- **`WiilNetworkError`** - Thrown when network communication fails (timeouts, connectivity issues)
- **`WiilConfigurationError`** - Thrown when SDK configuration is invalid

## Available Resources

The SDK provides access to the following resources organized by domain:

**Account Management:**

- `client.organizations` - Organization management (read-only)
- `client.projects` - Project management

**Service Configuration:**

- `client.agentConfigs` - AI agent configurations
- `client.deploymentConfigs` - Deployment configurations
- `client.deploymentChannels` - Communication channels
- `client.instructionConfigs` - Instruction configurations
- `client.phoneConfigs` - Phone configurations
- `client.provisioningConfigs` - Provisioning configurations
- `client.conversationConfigs` - Conversation configurations
- `client.translationSessions` - Translation sessions
- `client.knowledgeSources` - Knowledge source management

**Business Management:**

- `client.businessServices` - Business service catalog
- `client.customers` - Customer management
- `client.menus` - Menu catalog management
- `client.products` - Product catalog management
- `client.serviceAppointments` - Service appointment bookings
- `client.reservations` - Resource reservations
- `client.menuOrders` - Menu orders
- `client.productOrders` - Product orders
- `client.reservationResources` - Reservable resources

## TypeScript Support

The SDK is written in TypeScript and provides comprehensive type definitions:

```typescript
import {
  WiilClient,
  Organization,
  Project,
  CreateProject,
  UpdateProject,
  PaginatedResultType,
  PaginationRequest,
  ServiceStatus
} from 'wiil-js';

// All types are exported for your convenience
const createProject = async (input: CreateProject): Promise<Project> => {
  const client = new WiilClient({ apiKey: process.env.WIIL_API_KEY! });
  return client.projects.create(input);
};
```

## API Reference

For complete API documentation, see the [TypeDoc generated documentation](./docs/index.html).

To generate documentation locally:

```bash
npm run docs
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Watch Mode

```bash
npm run watch
```

## Requirements

- **Node.js**: 16.x or higher
- **TypeScript**: 5.x (for TypeScript projects)

## Security

⚠️ **Important**: This SDK is designed for **server-side use only**. Never expose your API key in client-side code (browsers, mobile apps).

- Store API keys securely using environment variables
- Never commit API keys to version control
- Use environment-specific API keys (development, staging, production)
- Rotate API keys regularly

### Best Practices

```typescript
// ✅ Good - Use environment variables
const client = new WiilClient({
  apiKey: process.env.WIIL_API_KEY!
});

// ❌ Bad - Never hardcode API keys
const client = new WiilClient({
  apiKey: 'your-api-key-here' // Don't do this!
});
```

## Platform Architecture

The WIIL Platform is built on four integrated domains:

| Domain | Purpose | Resources |
|--------|---------|-----------|
| **Service Configuration** | AI agent deployment and management | Agent Configs, Deployment Configs, Instruction Configs, Channels |
| **Advanced Service Configuration** | Voice processing pipelines (STT → Agent → TTS) | Provisioning Chains, Deployment Channels |
| **Translation Services** | Real-time multilingual translation | Translation Sessions, Conversation Configs, Knowledge Sources |
| **Business Management** | Catalog management and AI-powered transactions | Services, Products, Menus, Customers, Appointments, Orders |

The **Conversations** entity serves as the central integration hub, connecting AI agents with customers and driving business transactions.

## License

MIT © [WIIL](https://wiil.io)

## Support

- **Documentation**: [https://docs.wiil.io](https://docs.wiil.io)
- **API Reference**: [https://api.wiil.io/docs](https://api.wiil.io/docs)
- **Issues**: [GitHub Issues](https://github.com/wiil-io/wiil-js/issues)
- **Email**: [support@wiil.io](mailto:support@wiil.io)

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes in each version.

---

Built with ❤️ by the WIIL team
