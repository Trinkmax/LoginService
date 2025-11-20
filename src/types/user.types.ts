export enum UserRole {
  USER = 'user',
  HOST = 'host',
  ADMIN = 'admin',
}

export enum KYCStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  NOT_STARTED = 'not_started',
}

export interface User {
  id: string;
  clerk_id: string;
  email: string;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  profile_image_url: string | null;
  role: UserRole;
  kyc_status: KYCStatus;
  is_active: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
}

export interface CreateUserData {
  clerk_id: string;
  email: string;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
  profile_image_url?: string | null;
  email_verified?: boolean;
  phone_verified?: boolean;
}

export interface UpdateUserData {
  email?: string;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
  profile_image_url?: string | null;
  role?: UserRole;
  kyc_status?: KYCStatus;
  is_active?: boolean;
  email_verified?: boolean;
  phone_verified?: boolean;
  last_sign_in_at?: string;
}

