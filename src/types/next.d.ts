declare module 'next/headers' {
  export function cookies(): {
    get(name: string): { name: string; value: string } | undefined;
    getAll(): Array<{ name: string; value: string }>;
    set(name: string, value: string, options?: any): void;
  };
  export function headers(): Headers;
}

declare module 'next/navigation' {
  export function redirect(path: string): never;
} 