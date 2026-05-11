export interface ClaudeToolResult {
  reply: string;
}

export interface IClaudeService {
  chat(params: {
    messages: { role: string; content: string }[];
    patientPhone: string;
    clinicId: string;
  }): Promise<ClaudeToolResult>;
}

export const CLAUDE_SERVICE = Symbol('IClaudeService');
