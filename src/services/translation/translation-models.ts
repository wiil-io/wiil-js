import z from "zod";


export const SupportLanguageSchema = z.object({
    code: z.string().describe("ISO language code."),
    name: z.string().min(1).max(100).describe("Display name for the language in English."),
    nativeName: z.string().min(1).max(100).describe("Display name for the language in its native script."),
});

export const TranslationRequestSchema = z.object({
    initiatorId: z.string().describe("Unique identifier for the initiator of the translation session."),
    participantId: z.string().optional().describe("Unique identifier for the participant, when available."),
    initiatorLanguageCode: z.string().describe("Language code used by the initiator."),
    participantLanguageCode: z.string().describe("Language code used by the participant."),
    sessionId: z.string().optional().describe("Existing session identifier for continuity across requests."),
    provisioningConfigId: z.string().optional().describe("Provisioning configuration identifier used for routing and setup."),
});

export const TranslationConnectionConfigSchema = z.object({
    sdrtnId: z.string().describe("Service-defined real-time network identifier for the translation connection."),
    channelIdentifier: z.string().describe("Channel identifier used for session connectivity, such as a phone number."),
    initiatorAccessId: z.number().describe("Numeric access identifier assigned to the initiator."),
    initiatorToken: z.string().describe("Authentication token for the initiator connection."),
    participantAccessId: z.number().describe("Numeric access identifier assigned to the participant."),
    participantToken: z.string().describe("Authentication token for the participant connection."),
});


export type SupportLanguage = z.infer<typeof SupportLanguageSchema>;
export type TranslationRequest = z.infer<typeof TranslationRequestSchema>;
export type TranslationConnectionConfig = z.infer<typeof TranslationConnectionConfigSchema>;