'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(qi) {
    await qi.sequelize.transaction(async (t) => {
      await qi.renameColumn('users', 'deletedAt', 'deleted_at', {
        transaction: t,
      });

      await qi.renameColumn('refresh_tokens', 'userId', 'user_id', {
        transaction: t,
      });
      await qi.renameColumn('refresh_tokens', 'tokenHash', 'token_hash', {
        transaction: t,
      });
      await qi.renameColumn('refresh_tokens', 'familyId', 'family_id', {
        transaction: t,
      });
      await qi.renameColumn('refresh_tokens', 'expiresAt', 'expires_at', {
        transaction: t,
      });
      await qi.renameColumn('refresh_tokens', 'revokedAt', 'revoked_at', {
        transaction: t,
      });
      await qi.renameColumn('refresh_tokens', 'replacedByTokenId', 'replaced_by_token_id', {
        transaction: t,
      });
      await qi.renameColumn('refresh_tokens', 'userAgent', 'user_agent', {
        transaction: t,
      });
      await qi.renameColumn('refresh_tokens', 'deviceId', 'device_id', {
        transaction: t,
      });
    });
  },

  async down(qi) {
    await qi.sequelize.transaction(async (t) => {
      await qi.renameColumn('users', 'password_hash', 'passwordHash', {
        transaction: t,
      });
      await qi.renameColumn('users', 'deleted_at', 'deletedAt', {
        transaction: t,
      });

      await qi.renameColumn('refresh_tokens', 'user_id', 'userId', {
        transaction: t,
      });
      await qi.renameColumn('refresh_tokens', 'token_hash', 'tokenHash', {
        transaction: t,
      });
      await qi.renameColumn('refresh_tokens', 'family_id', 'familyId', {
        transaction: t,
      });
      await qi.renameColumn('refresh_tokens', 'expires_at', 'expiresAt', {
        transaction: t,
      });
      await qi.renameColumn('refresh_tokens', 'revoked_at', 'revokedAt', {
        transaction: t,
      });
      await qi.renameColumn('refresh_tokens', 'replaced_by_token_id', 'replacedByTokenId', {
        transaction: t,
      });
      await qi.renameColumn('refresh_tokens', 'user_agent', 'userAgent', {
        transaction: t,
      });
      await qi.renameColumn('refresh_tokens', 'device_id', 'deviceId', {
        transaction: t,
      });
    });
  },
};
