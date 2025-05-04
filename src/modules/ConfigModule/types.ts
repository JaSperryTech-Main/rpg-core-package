import { DefaultConfig } from "./registry";

export type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: `${K & string}${"" | `.${NestedKeyOf<T[K]>}`}`;
    }[keyof T]
  : never;

export type GetNestedType<
  T,
  K extends string
> = K extends `${infer P}.${infer S}`
  ? P extends keyof T
    ? T[P] extends object
      ? GetNestedType<T[P], S>
      : never
    : never
  : K extends keyof T
  ? T[K]
  : never;

export type Config = typeof DefaultConfig;
