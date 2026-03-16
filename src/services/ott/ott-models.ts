/**
 * @fileoverview OTT service models and Zod schemas.
 * @module services/ott/ott-models
 */

import z from 'zod';

/**
 * Contact information for OTT configuration requests.
 */
export const OttContactInfoSchema = z.object({
  email: z.email().optional().describe('Contact email address.'),
  phone: z.string().optional().describe('Contact phone number.'),
});

/**
 * Request payload for fetching OTT connection configuration.
 */
export const GetOttConfigurationRequestSchema = z.object({
  configId: z.string().min(1).describe('Configuration identifier.'),
  contact: OttContactInfoSchema.optional().describe('Contact information for the session.'),
});

/**
 * Chat connection configuration returned from the API.
 */
export const OttChatConnectionConfigSchema = z.object({
  connection_url: z.url().describe('WebSocket connection URL.'),
  channel_token: z.string().describe('Authentication token for the channel.'),
  channel_identifier: z.string().describe('Unique channel identifier.'),
});

/**
 * Voice connection configuration returned from the API.
 */
export const OttVoiceConnectionConfigSchema = z.object({
  sdrtn_id: z.string().describe('Service-defined real-time network identifier.'),
  channel_identifier: z.string().describe('Channel identifier for voice connection.'),
  channel_token: z.string().describe('Authentication token for voice channel.'),
  platform_user_id: z.union([z.string(), z.number()]).describe('Platform user identifier.'),
});

export type OttContactInfo = z.infer<typeof OttContactInfoSchema>;
export type GetOttConfigurationRequest = z.infer<typeof GetOttConfigurationRequestSchema>;
export type OttChatConnectionConfig = z.infer<typeof OttChatConnectionConfigSchema>;
export type OttVoiceConnectionConfig = z.infer<typeof OttVoiceConnectionConfigSchema>;
