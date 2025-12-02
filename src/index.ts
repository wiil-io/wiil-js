/**
 * @fileoverview WIIL JavaScript SDK - Main entry point
 * @module wiil-js
 *
 * @remarks
 * The WIIL JavaScript SDK provides a type-safe, production-grade client library
 * for interacting with the WIIL Platform API. It includes comprehensive support
 * for account management, business operations, and AI-powered conversational services.
 *
 * @example
 * ```typescript
 * import { WiilClient } from 'wiil-js';
 *
 * const client = new WiilClient({
 *   apiKey: 'your-api-key'
 * });
 *
 * // Get the organization that owns the API key
 * const org = await client.organizations.get();
 * console.log('Organization:', org.companyName);
 *
 * // Create a project
 * const project = await client.projects.create({
 *   name: 'Production Environment',
 *   isDefault: true
 * });
 * ```
 *
 * @packageDocumentation
 */

// Main client
export { WiilClient } from './client/WiilClient';

// Configuration types
export type { WiilClientConfig, APIResponse, APIErrorResponse } from './client/types';

// Error classes
export {
  WiilError,
  WiilAPIError,
  WiilValidationError,
  WiilNetworkError,
  WiilConfigurationError,
} from './errors/WiilError';

// Re-export commonly used types from wiil-core-js
export type {
  Organization,
  Project,
  CreateProject,
  UpdateProject,
  PaginatedResultType,
  PaginationRequest,
  PaginationMetaType,
  ServiceStatus,
} from 'wiil-core-js';
