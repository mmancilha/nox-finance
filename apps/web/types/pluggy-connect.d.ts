// Tipos para o Pluggy Connect Widget
// https://docs.pluggy.ai/docs/connect-widget

export interface PluggyConnectSuccessData {
  item: {
    id: string;
    connector: {
      id: number;
      name: string;
      institutionUrl?: string;
      imageUrl?: string;
    };
  };
}

export interface PluggyConnectConfig {
  connectToken: string;
  onSuccess: (data: PluggyConnectSuccessData) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
  /** Idioma da interface. Default: 'pt-BR' */
  language?: 'pt-BR' | 'en-US';
}

export interface PluggyConnectInstance {
  init: () => void;
  destroy: () => void;
}

export interface PluggyConnectConstructor {
  new (config: PluggyConnectConfig): PluggyConnectInstance;
}

declare global {
  interface Window {
    PluggyConnect?: PluggyConnectConstructor;
  }
}

export {};
