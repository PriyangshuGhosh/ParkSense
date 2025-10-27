// api.d.ts
export function useSecureApi(): {
  secureFetch: (endpoint: string, method?: string, body?: any) => Promise<any>;
};