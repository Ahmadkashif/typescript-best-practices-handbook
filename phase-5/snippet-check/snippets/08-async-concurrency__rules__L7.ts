declare function sendEmail(): Promise<void>;
export function handler(): void { sendEmail(); } // rejection lost; lint error
export {};
