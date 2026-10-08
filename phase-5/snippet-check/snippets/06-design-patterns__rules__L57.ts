type Channel = 'email' | 'sms';
type Notify = (to: string, msg: string) => Promise<void>;
export const notifiers: Record<Channel, Notify> = {
  email: async (to, msg) => { void to; void msg; },
  sms: async (to, msg) => { void to; void msg; },
};
export {};
