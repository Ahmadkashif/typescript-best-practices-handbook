export async function withTempResource(): Promise<number> {
  await using res = {
    value: 42,
    async [Symbol.asyncDispose]() { /* release */ },
  };
  return res.value;
}
export {};
