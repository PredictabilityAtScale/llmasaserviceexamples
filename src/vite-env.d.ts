/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LLMASASERVICE_DEMO_LLMASERVICE_AGENT_ID: string
  readonly VITE_LLMASASERVICE_DEMO_SALES_AGENT_ID: string
  readonly VITE_LLMASASERVICE_DEMO_ONBOARDING_AGENT_ID: string
  readonly VITE_LLMASASERVICE_DEMO_BANT_EXTRACTOR_AGENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'llmasaservice-ui' {
  import { ReactNode } from 'react';
  
  interface AgentPanelProps {
    agent: string;
    data?: {
      key: string;
      data: string;
    }[];
    actions?: {
      id: string;
      name: string;
      action: () => void;
      pattern?: string;
      callback?: (matches: string[]) => void;
    }[];
    url?: string;
    historyChangedCallback?: (history: { [key: string]: { content: string; callId: string } }) => void;
    responseCompleteCallback?: (callId: string, prompt: string, response: string) => void;
    followOnPrompt?: string | null;
    onFollowOnPromptSent?: () => void;
  }
  
  export const AgentPanel: React.FC<AgentPanelProps>;
}
