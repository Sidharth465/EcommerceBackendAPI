'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename columns
    await queryInterface.renameColumn("wallet", "userId", "user_id");
    await queryInterface.renameColumn("transaction_table", "userId", "user_id");

    // Rename table
    await queryInterface.renameTable("transaction_table", "transaction_history");
  },

  async down(queryInterface, Sequelize) {
    // Revert table rename
    await queryInterface.renameTable("transaction_history", "transaction_table");

    // Revert column renames
    await queryInterface.renameColumn("wallet", "user_id", "userId");
    await queryInterface.renameColumn("transaction_table", "user_id", "userId");
  }
};
