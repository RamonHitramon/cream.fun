export const config = {
  builder: {
    address: process.env.NEXT_PUBLIC_BUILDER_ADDRESS || "0x0000000000000000000000000000000000000000",
    feeBps: parseInt(process.env.NEXT_PUBLIC_BUILDER_FEE_BPS || "1"),
    defaultSlippageBps: parseInt(process.env.NEXT_PUBLIC_DEFAULT_SLIPPAGE_BPS || "10"),
  },
  hyperliquid: {
    infoUrl: "https://api.hyperliquid.xyz/info",
    exchangeUrl: "https://api.hyperliquid.xyz/exchange",
  }
};
