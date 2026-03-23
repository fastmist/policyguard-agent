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

/**
 * OpenClaw Plugin Registration
 * 
 * This function is called by OpenClaw when the plugin is loaded.
 * It registers tools and commands for PolicyGuard integration.
 */
export function register(api: any) {
  const plugin = new PolicyGuardPlugin();
  
  // Register PolicyGuard tool
  api.registerTool({
    name: "policyguard",
    description: "Human-in-the-loop transaction approval for Hedera",
    handler: async (params: { command: string; userId: string }) => {
      const result = await plugin.handle(params.command, params.userId);
      return result || null;
    }
  });

  // Register slash command
  api.registerCommand({
    name: "policyguard",
    description: "Send HBAR or approve transactions via PolicyGuard",
    acceptsArgs: true,
    handler: async (ctx: any) => {
      const command = ctx.args || ctx.commandBody;
      const result = await plugin.handle(command, ctx.senderId);
      return { text: result || "Unknown PolicyGuard command. Try: 'Send 20 HBAR to bob' or 'Show balance'" };
    }
  });

  // Log registration
  api.logger?.info("PolicyGuard Agent plugin registered");
}
