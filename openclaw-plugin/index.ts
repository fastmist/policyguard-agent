import { PolicyGuardPlugin } from './bridge';

/**
 * PolicyGuard OpenClaw Plugin
 * 
 * Provides natural language interface to PolicyGuard Agent for Hedera.
 * 
 * SAFETY NOTICE: This plugin NEVER auto-approves transactions.
 * It creates challenges and waits for explicit user approval.
 * 
 * Usage:
 * ```typescript
 * import { policyGuardPlugin } from './index';
 * 
 * const response = await policyGuardPlugin.handle(userInput, userId);
 * if (response) {
 *   // This was a PolicyGuard command
 *   return response;
 * }
 * ```
 */

export { PolicyGuardPlugin, policyGuard } from './bridge';

// Default export for OpenClaw integration
export default PolicyGuardPlugin;
