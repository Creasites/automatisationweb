import { promises as fs } from "node:fs";
import path from "node:path";

export type UserRecord = {
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  trialEndsAt: string;
  subscriptionStatus: "inactive" | "active";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
};

type UsersDb = {
  users: UserRecord[];
};

type SupabaseUserRow = {
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
  trial_ends_at: string;
  subscription_status: "inactive" | "active";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
};

const dataDir = path.resolve(process.cwd(), "..", "data");
const usersDbPath = path.join(dataDir, "users.json");

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) {
    return null;
  }

  try {
    new URL(url);
  } catch {
    throw new Error("SUPABASE_URL_INVALID");
  }

  return {
    url: url.replace(/\/$/, ""),
    serviceRoleKey,
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function fromSupabaseRow(row: SupabaseUserRow): UserRecord {
  return {
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    trialEndsAt: row.trial_ends_at,
    subscriptionStatus: row.subscription_status,
    stripeCustomerId: row.stripe_customer_id ?? undefined,
    stripeSubscriptionId: row.stripe_subscription_id ?? undefined,
  };
}

async function supabaseRequest<T>(
  config: { url: string; serviceRoleKey: string },
  input: {
    path: string;
    method?: "GET" | "POST" | "PATCH";
    body?: unknown;
    preferRepresentation?: boolean;
  }
) {
  const response = await fetch(`${config.url}${input.path}`, {
    method: input.method ?? "GET",
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
      ...(input.preferRepresentation ? { Prefer: "return=representation" } : {}),
    },
    body: input.body ? JSON.stringify(input.body) : undefined,
  });

  const raw = await response.text();
  let parsed: unknown = null;

  if (raw.length > 0) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = raw;
    }
  }

  if (!response.ok) {
    throw {
      status: response.status,
      body: parsed,
    };
  }

  return parsed as T;
}

function toSupabasePatch(patch: Partial<UserRecord>) {
  const rowPatch: Partial<SupabaseUserRow> = {
    updated_at: new Date().toISOString(),
  };

  if (patch.passwordHash !== undefined) {
    rowPatch.password_hash = patch.passwordHash;
  }

  if (patch.trialEndsAt !== undefined) {
    rowPatch.trial_ends_at = patch.trialEndsAt;
  }

  if (patch.subscriptionStatus !== undefined) {
    rowPatch.subscription_status = patch.subscriptionStatus;
  }

  if (patch.stripeCustomerId !== undefined) {
    rowPatch.stripe_customer_id = patch.stripeCustomerId ?? null;
  }

  if (patch.stripeSubscriptionId !== undefined) {
    rowPatch.stripe_subscription_id = patch.stripeSubscriptionId ?? null;
  }

  return rowPatch;
}

async function ensureDb() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(usersDbPath);
  } catch {
    const initial: UsersDb = { users: [] };
    await fs.writeFile(usersDbPath, JSON.stringify(initial, null, 2), "utf-8");
  }
}

async function readDb() {
  await ensureDb();
  const raw = await fs.readFile(usersDbPath, "utf-8");
  return JSON.parse(raw) as UsersDb;
}

async function writeDb(data: UsersDb) {
  await fs.writeFile(usersDbPath, JSON.stringify(data, null, 2), "utf-8");
}

export async function findUserByEmail(email: string) {
  const supabase = getSupabaseConfig();
  if (supabase) {
    try {
      const normalized = normalizeEmail(email);
      const rows = await supabaseRequest<SupabaseUserRow[]>(supabase, {
        path: `/rest/v1/users?select=*&email=eq.${encodeURIComponent(normalized)}&limit=1`,
      });
      return rows.length > 0 ? fromSupabaseRow(rows[0]) : null;
    } catch (error) {
      const status =
        typeof error === "object" && error !== null && "status" in error
          ? (error as { status?: number }).status
          : undefined;
      const message = error instanceof Error ? error.message : undefined;
      throw new Error(
        `SUPABASE_FIND_USER_EMAIL_FAILED${status ? `:${status}` : ""}${
          message ? `:${message}` : ""
        }`
      );
    }
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("SUPABASE_CONFIG_MISSING");
  }

  try {
    const db = await readDb();
    return db.users.find((user) => user.email.toLowerCase() === normalizeEmail(email)) ?? null;
  } catch {
    throw new Error("LOCAL_STORAGE_UNAVAILABLE");
  }
}

export async function findUserByStripeCustomerId(customerId: string) {
  const supabase = getSupabaseConfig();
  if (supabase) {
    try {
      const rows = await supabaseRequest<SupabaseUserRow[]>(supabase, {
        path: `/rest/v1/users?select=*&stripe_customer_id=eq.${encodeURIComponent(customerId)}&limit=1`,
      });
      return rows.length > 0 ? fromSupabaseRow(rows[0]) : null;
    } catch {
      throw new Error("SUPABASE_FIND_USER_CUSTOMER_FAILED");
    }
  }

  const db = await readDb();
  return db.users.find((user) => user.stripeCustomerId === customerId) ?? null;
}

export async function createUser(input: {
  email: string;
  passwordHash: string;
  trialEndsAt: string;
}) {
  const supabase = getSupabaseConfig();
  if (supabase) {
    const normalizedEmail = normalizeEmail(input.email);
    const now = new Date().toISOString();

    try {
      const rows = await supabaseRequest<SupabaseUserRow[]>(supabase, {
        path: "/rest/v1/users",
        method: "POST",
        preferRepresentation: true,
        body: {
          email: normalizedEmail,
          password_hash: input.passwordHash,
          trial_ends_at: input.trialEndsAt,
          created_at: now,
          updated_at: now,
          subscription_status: "inactive",
        },
      });

      if (rows.length === 0) {
        throw new Error("SUPABASE_CREATE_USER_EMPTY");
      }

      return fromSupabaseRow(rows[0]);
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "body" in error &&
        typeof (error as { body?: unknown }).body === "object" &&
        (error as { body?: { code?: string } }).body?.code === "23505"
      ) {
        throw new Error("Utilisateur déjà existant");
      }

      const status =
        typeof error === "object" && error !== null && "status" in error
          ? (error as { status?: number }).status
          : undefined;
      const message = error instanceof Error ? error.message : undefined;
      throw new Error(
        `SUPABASE_CREATE_USER_FAILED${status ? `:${status}` : ""}${
          message ? `:${message}` : ""
        }`
      );
    }
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("SUPABASE_CONFIG_MISSING");
  }

  try {
    const db = await readDb();
    const normalizedEmail = normalizeEmail(input.email);
    const existing = db.users.find((user) => user.email.toLowerCase() === normalizedEmail);

    if (existing) {
      throw new Error("Utilisateur déjà existant");
    }

    const now = new Date().toISOString();
    const user: UserRecord = {
      email: normalizedEmail,
      passwordHash: input.passwordHash,
      createdAt: now,
      updatedAt: now,
      trialEndsAt: input.trialEndsAt,
      subscriptionStatus: "inactive",
    };

    db.users.push(user);
    await writeDb(db);

    return user;
  } catch (error) {
    if (error instanceof Error && error.message === "Utilisateur déjà existant") {
      throw error;
    }
    throw new Error("LOCAL_STORAGE_UNAVAILABLE");
  }
}

export async function updateUser(email: string, patch: Partial<UserRecord>) {
  const supabase = getSupabaseConfig();
  if (supabase) {
    try {
      const normalized = normalizeEmail(email);
      const rows = await supabaseRequest<SupabaseUserRow[]>(supabase, {
        path: `/rest/v1/users?email=eq.${encodeURIComponent(normalized)}`,
        method: "PATCH",
        preferRepresentation: true,
        body: toSupabasePatch(patch),
      });

      return rows.length > 0 ? fromSupabaseRow(rows[0]) : null;
    } catch {
      throw new Error("SUPABASE_UPDATE_USER_FAILED");
    }
  }

  const db = await readDb();
  const normalizedEmail = normalizeEmail(email);
  const index = db.users.findIndex((user) => user.email.toLowerCase() === normalizedEmail);

  if (index === -1) {
    return null;
  }

  const current = db.users[index];
  const updated: UserRecord = {
    ...current,
    ...patch,
    email: current.email,
    updatedAt: new Date().toISOString(),
  };

  db.users[index] = updated;
  await writeDb(db);
  return updated;
}

export async function updateUserByStripeCustomerId(
  stripeCustomerId: string,
  patch: Partial<UserRecord>
) {
  const supabase = getSupabaseConfig();
  if (supabase) {
    try {
      const rows = await supabaseRequest<SupabaseUserRow[]>(supabase, {
        path: `/rest/v1/users?stripe_customer_id=eq.${encodeURIComponent(stripeCustomerId)}`,
        method: "PATCH",
        preferRepresentation: true,
        body: toSupabasePatch(patch),
      });

      return rows.length > 0 ? fromSupabaseRow(rows[0]) : null;
    } catch {
      throw new Error("SUPABASE_UPDATE_BY_CUSTOMER_FAILED");
    }
  }

  const db = await readDb();
  const index = db.users.findIndex((user) => user.stripeCustomerId === stripeCustomerId);

  if (index === -1) {
    return null;
  }

  const current = db.users[index];
  const updated: UserRecord = {
    ...current,
    ...patch,
    email: current.email,
    updatedAt: new Date().toISOString(),
  };

  db.users[index] = updated;
  await writeDb(db);
  return updated;
}
