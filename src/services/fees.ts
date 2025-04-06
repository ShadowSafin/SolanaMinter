
import { CoinCreationParams, FEES } from "@/lib/constants";

/**
 * Calculate fee based on params
 */
export const calculateFeeFromParams = (params: CoinCreationParams): number => {
  let fee = FEES.BASE_FEE; // Base fee
  
  if (params.revokeMint) fee += FEES.REVOKE_MINT;
  if (params.revokeUpdate) fee += FEES.REVOKE_UPDATE;
  if (params.revokeFreeze) fee += FEES.REVOKE_FREEZE;
  if (params.socials.length > 0) fee += FEES.SOCIALS_UPDATE;
  
  return fee;
};
