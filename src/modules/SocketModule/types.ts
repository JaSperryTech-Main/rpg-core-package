import { TAttributes } from "@modules/AttributeModule";

export type TGem = {
  id: string;
  name: string;
  color: string;
  bonusAttributes: TAttributes;
};

export type TSocket = {
  id: string;
  color: string;
  linkedTo?: string[];
  gem?: TGem;
};

export type SocketSet = TSocket[];
