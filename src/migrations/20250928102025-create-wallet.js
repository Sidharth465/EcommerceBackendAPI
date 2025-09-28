'use strict';


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('wallet',{
      id:{type:Sequelize.UUID,
        defaultValue:Sequelize.literal("gen_random_uuid()"),
        allowNull:false,
        primaryKey:true
      },
      userId:{
        type:Sequelize.UUID,
        references:{
          model:'users',
          key:"id"
        },
        onDelete:"CASCADE",
        onUpdate:"CASCADE",
        allowNull:false },
        amount:
        {type:Sequelize.DECIMAL(10,2),
          allowNull:false},
          created_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
          deleted_at: {
            type: Sequelize.DATE,
            allowNull: true,
          },
      
    })
    await queryInterface.createTable('transaction_table',{
      id:{type:Sequelize.UUID,
        defaultValue:Sequelize.literal("gen_random_uuid()"),
        allowNull:false,
        primaryKey:true
      },
      userId:{
        type:Sequelize.UUID,
        references:{
          model:'users',
          key:"id"
        },
        onDelete:"CASCADE",
        onUpdate:"CASCADE",
        allowNull:false },
      amount:
        {
          type:Sequelize.DECIMAL(10,2),
        allowNull:false},
      transaction_type:{type:Sequelize.STRING,
        allowNull:false},
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
    })
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('wallet');
    await queryInterface.dropTable('transaction_table');
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
