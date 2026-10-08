type Clock = { now(): Date };
type Mailer = { send(to: string, body: string): Promise<void> };
export type WelcomeService = { welcome(email: string): Promise<void> };

export function createWelcomeService(deps: { clock: Clock; mailer: Mailer }): WelcomeService {
  return {
    async welcome(email) {
      await deps.mailer.send(email, `Welcome! (${deps.clock.now().toISOString()})`);
    },
  };
}
export {};
