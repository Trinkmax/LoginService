// Tipos de eventos de Clerk
export enum ClerkWebhookEventType {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  SESSION_CREATED = 'session.created',
  SESSION_ENDED = 'session.ended',
  SESSION_REMOVED = 'session.removed',
  SESSION_REVOKED = 'session.revoked',
}

// Estructura de un usuario de Clerk
export interface ClerkUserData {
  id: string;
  object: 'user';
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  profile_image_url: string;
  primary_email_address_id: string | null;
  primary_phone_number_id: string | null;
  primary_web3_wallet_id: string | null;
  email_addresses: ClerkEmailAddress[];
  phone_numbers: ClerkPhoneNumber[];
  web3_wallets: any[];
  external_accounts: any[];
  public_metadata: Record<string, any>;
  private_metadata: Record<string, any>;
  unsafe_metadata: Record<string, any>;
  created_at: number;
  updated_at: number;
  last_sign_in_at: number | null;
  banned: boolean;
  locked: boolean;
  lockout_expires_in_seconds: number | null;
  verification_attempts_remaining: number | null;
}

export interface ClerkEmailAddress {
  id: string;
  object: 'email_address';
  email_address: string;
  verification: {
    status: 'verified' | 'unverified';
    strategy: string;
    attempts: number | null;
    expire_at: number | null;
  };
  linked_to: any[];
  created_at: number;
  updated_at: number;
}

export interface ClerkPhoneNumber {
  id: string;
  object: 'phone_number';
  phone_number: string;
  reserved_for_second_factor: boolean;
  default_second_factor: boolean;
  verification: {
    status: 'verified' | 'unverified';
    strategy: string;
    attempts: number | null;
    expire_at: number | null;
  };
  linked_to: any[];
  backup_codes: string[];
  created_at: number;
  updated_at: number;
}

export interface ClerkSessionData {
  id: string;
  object: 'session';
  client_id: string;
  user_id: string;
  status: 'active' | 'ended' | 'removed' | 'revoked' | 'expired' | 'abandoned';
  last_active_at: number;
  expire_at: number;
  abandon_at: number;
  created_at: number;
  updated_at: number;
}

// Estructura del payload del webhook
export interface ClerkWebhookPayload {
  data: ClerkUserData | ClerkSessionData;
  object: 'event';
  type: ClerkWebhookEventType;
  event_attributes?: Record<string, any>;
}

