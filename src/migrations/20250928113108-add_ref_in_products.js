'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add foreign key constraint to category_id
    await queryInterface.addConstraint('products', {
      fields: ['category_id'], // column to add FK
      type: 'foreign key',

      references: {
        table: 'categories', // referenced table
        field: 'id',         // referenced column
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove foreign key constraint
    await queryInterface.removeConstraint('products', 'fk_products_category');
  }
};
