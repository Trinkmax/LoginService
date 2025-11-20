import supabaseAdmin from '../config/database';
import { CreateUserData, UpdateUserData, User, UserRole, KYCStatus } from '../types/user.types';
import { ClerkUserData } from '../types/webhook.types';

export class UserService {
  /**
   * Obtener usuario por Clerk ID
   */
  async getUserByClerkId(clerkId: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No encontrado
      }
      throw new Error(`Error al obtener usuario: ${error.message}`);
    }

    return data;
  }

  /**
   * Obtener usuario por email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error al obtener usuario por email: ${error.message}`);
    }

    return data;
  }

  /**
   * Crear nuevo usuario desde webhook de Clerk
   */
  async createUserFromClerk(clerkUserData: ClerkUserData): Promise<User> {
    // Obtener email principal
    const primaryEmail = clerkUserData.email_addresses.find(
      (email) => email.id === clerkUserData.primary_email_address_id
    );

    if (!primaryEmail) {
      throw new Error('Usuario de Clerk no tiene email principal');
    }

    // Obtener teléfono principal
    const primaryPhone = clerkUserData.phone_numbers.find(
      (phone) => phone.id === clerkUserData.primary_phone_number_id
    );

    // Construir nombre completo
    const fullName = [clerkUserData.first_name, clerkUserData.last_name]
      .filter(Boolean)
      .join(' ') || null;

    const userData: CreateUserData = {
      clerk_id: clerkUserData.id,
      email: primaryEmail.email_address,
      name: fullName,
      first_name: clerkUserData.first_name,
      last_name: clerkUserData.last_name,
      phone_number: primaryPhone?.phone_number || null,
      profile_image_url: clerkUserData.profile_image_url || null,
      email_verified: primaryEmail.verification.status === 'verified',
      phone_verified: primaryPhone?.verification.status === 'verified' || false,
    };

    return this.createUser(userData);
  }

  /**
   * Crear usuario en la base de datos
   */
  async createUser(userData: CreateUserData): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        ...userData,
        role: UserRole.USER,
        kyc_status: KYCStatus.NOT_STARTED,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear usuario: ${error.message}`);
    }

    return data;
  }

  /**
   * Actualizar usuario desde webhook de Clerk
   */
  async updateUserFromClerk(clerkUserData: ClerkUserData): Promise<User> {
    const existingUser = await this.getUserByClerkId(clerkUserData.id);

    if (!existingUser) {
      throw new Error(`Usuario con Clerk ID ${clerkUserData.id} no encontrado`);
    }

    // Obtener email principal
    const primaryEmail = clerkUserData.email_addresses.find(
      (email) => email.id === clerkUserData.primary_email_address_id
    );

    // Obtener teléfono principal
    const primaryPhone = clerkUserData.phone_numbers.find(
      (phone) => phone.id === clerkUserData.primary_phone_number_id
    );

    // Construir nombre completo
    const fullName = [clerkUserData.first_name, clerkUserData.last_name]
      .filter(Boolean)
      .join(' ') || null;

    const updateData: UpdateUserData = {
      email: primaryEmail?.email_address,
      name: fullName,
      first_name: clerkUserData.first_name,
      last_name: clerkUserData.last_name,
      phone_number: primaryPhone?.phone_number || null,
      profile_image_url: clerkUserData.profile_image_url || null,
      email_verified: primaryEmail?.verification.status === 'verified',
      phone_verified: primaryPhone?.verification.status === 'verified' || false,
      is_active: !clerkUserData.banned && !clerkUserData.locked,
      last_sign_in_at: clerkUserData.last_sign_in_at
        ? new Date(clerkUserData.last_sign_in_at).toISOString()
        : null,
    };

    return this.updateUser(clerkUserData.id, updateData);
  }

  /**
   * Actualizar usuario
   */
  async updateUser(clerkId: string, updateData: UpdateUserData): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_id', clerkId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }

    return data;
  }

  /**
   * Eliminar usuario (soft delete)
   */
  async deleteUser(clerkId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('users')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_id', clerkId);

    if (error) {
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
  }

  /**
   * Eliminar usuario permanentemente (hard delete)
   */
  async deleteUserPermanently(clerkId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('clerk_id', clerkId);

    if (error) {
      throw new Error(`Error al eliminar usuario permanentemente: ${error.message}`);
    }
  }
}

export const userService = new UserService();

