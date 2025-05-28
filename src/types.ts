export interface AlertType {
  variant: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

declare global {
  interface Window {
    ethereum: {
      request: (args: { method: string; params: any[] }) => Promise<any>;
    };
  }
}

export {}; 