'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(qi) {
    // up

    await qi.renameColumn('refresh_tokens', 'createdAt', 'created_at');
    await qi.renameColumn('refresh_tokens', 'updatedAt', 'updated_at');
    // no deletedAt here unless you added it
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down(qi) {
    // down

    await qi.renameColumn('refresh_tokens', 'created_at', 'createdAt');
    await qi.renameColumn('refresh_tokens', 'updated_at', 'updatedAt');
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
