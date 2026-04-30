export interface AIProvider { generate(prompt: string, input: unknown): Promise<any>; }
export class MockAIProvider implements AIProvider {
  async generate(prompt: string, input: any) { return { promptUsed: prompt, input }; }
}
