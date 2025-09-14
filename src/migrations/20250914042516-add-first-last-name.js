"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // up
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "first_name", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn("users", "last_name", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.sequelize.query(`
      UPDATE users
      SET
        first_name = split_part(name, ' ', 1),
        last_name  = NULLIF(regexp_replace(name, '^[^ ]+\\s*', ''), '')
      WHERE name IS NOT NULL
        AND (first_name IS NULL OR last_name IS NULL);
    `);
    await queryInterface.removeColumn("users", "name");
  },

  // down
  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "name", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.sequelize.query(`
      UPDATE users
      SET name = TRIM(
        COALESCE(first_name, '') ||
        CASE WHEN COALESCE(last_name, '') <> '' THEN ' ' || last_name ELSE '' END
      )
      WHERE name IS NULL;
    `);
    await queryInterface.removeColumn("users", "first_name");
    await queryInterface.removeColumn("users", "last_name");
  },
};
