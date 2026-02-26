import type { SessionPayload } from "@backend/auth/session";
import type { UserRecord } from "@backend/users/store";

export type AccessStatus = {
  hasAccess: boolean;
  reason: "active_subscription" | "trial" | "expired";
  trialEndsAt: string;
  trialDaysLeft: number;
  subscriptionStatus: "inactive" | "active";
};

function normalizeStatus(input: {
  trialEndsAt: string;
  subscriptionStatus: "inactive" | "active";
}): AccessStatus {
  const now = Date.now();
  const trialEndsTime = new Date(input.trialEndsAt).getTime();
  const trialDaysLeft = Math.max(0, Math.ceil((trialEndsTime - now) / (1000 * 60 * 60 * 24)));

  if (input.subscriptionStatus === "active") {
    return {
      hasAccess: true,
      reason: "active_subscription",
      trialEndsAt: input.trialEndsAt,
      trialDaysLeft,
      subscriptionStatus: "active",
    };
  }

  if (trialEndsTime > now) {
    return {
      hasAccess: true,
      reason: "trial",
      trialEndsAt: input.trialEndsAt,
      trialDaysLeft,
      subscriptionStatus: "inactive",
    };
  }

  return {
    hasAccess: false,
    reason: "expired",
    trialEndsAt: input.trialEndsAt,
    trialDaysLeft: 0,
    subscriptionStatus: input.subscriptionStatus,
  };
}

export function getAccessStatus(source: UserRecord | SessionPayload) {
  return normalizeStatus({
    trialEndsAt: source.trialEndsAt,
    subscriptionStatus: source.subscriptionStatus,
  });
}
