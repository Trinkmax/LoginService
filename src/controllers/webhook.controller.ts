import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import {
  ClerkWebhookPayload,
  ClerkWebhookEventType,
  ClerkUserData,
} from '../types/webhook.types';

export class WebhookController {
  /**
   * Handler principal para webhooks de Clerk
   */
  async handleClerkWebhook(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body as ClerkWebhookPayload;
      const eventType = payload.type;

      console.log(`📥 Webhook recibido: ${eventType}`);

      switch (eventType) {
        case ClerkWebhookEventType.USER_CREATED:
          await this.handleUserCreated(payload);
          break;

        case ClerkWebhookEventType.USER_UPDATED:
          await this.handleUserUpdated(payload);
          break;

        case ClerkWebhookEventType.USER_DELETED:
          await this.handleUserDeleted(payload);
          break;

        case ClerkWebhookEventType.SESSION_CREATED:
          await this.handleSessionCreated(payload);
          break;

        case ClerkWebhookEventType.SESSION_ENDED:
        case ClerkWebhookEventType.SESSION_REMOVED:
        case ClerkWebhookEventType.SESSION_REVOKED:
          await this.handleSessionEnded(payload);
          break;

        default:
          console.log(`⚠️ Evento no manejado: ${eventType}`);
      }

      res.status(200).json({
        success: true,
        message: 'Webhook procesado correctamente',
      });
    } catch (error) {
      console.error('❌ Error procesando webhook:', error);
      res.status(500).json({
        success: false,
        error: 'Error procesando webhook',
      });
    }
  }

  /**
   * Handler para user.created
   */
  private async handleUserCreated(payload: ClerkWebhookPayload): Promise<void> {
    const userData = payload.data as ClerkUserData;
    console.log(`👤 Creando usuario: ${userData.id}`);

    try {
      const user = await userService.createUserFromClerk(userData);
      console.log(`✅ Usuario creado en DB: ${user.id} (Clerk: ${user.clerk_id})`);
    } catch (error: any) {
      // Si el usuario ya existe, intentar actualizarlo
      if (error.message.includes('duplicate') || error.message.includes('already exists')) {
        console.log(`⚠️ Usuario ya existe, actualizando: ${userData.id}`);
        await userService.updateUserFromClerk(userData);
      } else {
        throw error;
      }
    }
  }

  /**
   * Handler para user.updated
   */
  private async handleUserUpdated(payload: ClerkWebhookPayload): Promise<void> {
    const userData = payload.data as ClerkUserData;
    console.log(`🔄 Actualizando usuario: ${userData.id}`);

    try {
      const user = await userService.updateUserFromClerk(userData);
      console.log(`✅ Usuario actualizado: ${user.id}`);
    } catch (error: any) {
      // Si el usuario no existe, crearlo
      if (error.message.includes('no encontrado') || error.message.includes('not found')) {
        console.log(`⚠️ Usuario no existe, creándolo: ${userData.id}`);
        await userService.createUserFromClerk(userData);
      } else {
        throw error;
      }
    }
  }

  /**
   * Handler para user.deleted
   */
  private async handleUserDeleted(payload: ClerkWebhookPayload): Promise<void> {
    const userData = payload.data as ClerkUserData;
    console.log(`🗑️ Eliminando usuario: ${userData.id}`);

    // Soft delete por defecto
    await userService.deleteUser(userData.id);
    console.log(`✅ Usuario desactivado: ${userData.id}`);

    // Si quieres hard delete, descomenta:
    // await userService.deleteUserPermanently(userData.id);
  }

  /**
   * Handler para session.created
   */
  private async handleSessionCreated(payload: ClerkWebhookPayload): Promise<void> {
    const sessionData = payload.data as any;
    console.log(`🔐 Sesión creada: ${sessionData.id} para usuario: ${sessionData.user_id}`);

    // Actualizar last_sign_in_at
    try {
      await userService.updateUser(sessionData.user_id, {
        last_sign_in_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`❌ Error actualizando last_sign_in_at:`, error);
    }
  }

  /**
   * Handler para session.ended/removed/revoked
   */
  private async handleSessionEnded(payload: ClerkWebhookPayload): Promise<void> {
    const sessionData = payload.data as any;
    console.log(`🔓 Sesión terminada: ${sessionData.id} para usuario: ${sessionData.user_id}`);
    // Puedes agregar lógica adicional aquí si necesitas
  }
}

export const webhookController = new WebhookController();

