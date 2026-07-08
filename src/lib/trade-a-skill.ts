import type { Address } from "viem";

export const MAX_OFFER_LENGTH = 42;
export const MAX_WANT_LENGTH = 42;
export const MAX_FORMAT_LENGTH = 24;
export const MAX_TIME_LENGTH = 28;
export const MAX_NOTE_LENGTH = 180;

export const tradeASkillAbi = [
  {
    type: "event",
    name: "CardPosted",
    inputs: [
      { name: "cardId", type: "uint256", indexed: true },
      { name: "maker", type: "address", indexed: true },
      { name: "offerSkill", type: "string", indexed: false },
      { name: "wantSkill", type: "string", indexed: false },
      { name: "format", type: "string", indexed: false },
    ],
  },
  {
    type: "function",
    name: "postCard",
    stateMutability: "nonpayable",
    inputs: [
      { name: "offerSkill", type: "string" },
      { name: "wantSkill", type: "string" },
      { name: "format", type: "string" },
      { name: "timeWindow", type: "string" },
      { name: "note", type: "string" },
    ],
    outputs: [{ name: "cardId", type: "uint256" }],
  },
  {
    type: "function",
    name: "getCard",
    stateMutability: "view",
    inputs: [{ name: "cardId", type: "uint256" }],
    outputs: [
      { name: "maker", type: "address" },
      { name: "offerSkill", type: "string" },
      { name: "wantSkill", type: "string" },
      { name: "format", type: "string" },
      { name: "timeWindow", type: "string" },
      { name: "note", type: "string" },
      { name: "createdAt", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "nextCardId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

function isAddressLike(value?: string) {
  return Boolean(value && /^0x[a-fA-F0-9]{40}$/.test(value));
}

const configuredTradeASkillContractAddress =
  process.env.NEXT_PUBLIC_TRADE_A_SKILL_CONTRACT_ADDRESS?.trim();

export const tradeASkillContractAddress = isAddressLike(configuredTradeASkillContractAddress)
  ? (configuredTradeASkillContractAddress as Address)
  : undefined;
