export interface StaticOptions {
  stagePath: boolean;
}

export type Static = (asset: string, options?: StaticOptions) => string;
