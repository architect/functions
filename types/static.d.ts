export interface StaticOptions {
  stagePath: boolean;
}

export type ArcStatic = (asset: string, options?: StaticOptions) => string;
