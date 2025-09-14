"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn("users", "passwordHash", "password_hash");
  },

  async down(qi) {
    await qi.renameColumn("users", "password_hash", "passwordHash");
  },
};
