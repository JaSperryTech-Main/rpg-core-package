// modules/attributes/types.ts

export type TAttributes = Record<string, number>;

export type AttributeSource = {
  base: TAttributes;
  bonus?: Partial<TAttributes>;
  percentBonus?: Partial<TAttributes>;
};
