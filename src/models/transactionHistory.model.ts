import { DataTypes, Sequelize } from "sequelize";


export const defineTransactionHistoryModel =  (sequelize:Sequelize) =>{
    const TransactionHistory = sequelize.define('TransactionHistory', {
        id:{type:DataTypes.UUID,
            defaultValue:DataTypes.UUIDV4,
            allowNull:false,
            primaryKey:true
          },
          userId:{
            type:DataTypes.UUID,
            references:{
              model:'users',
              key:"id"
            },
            onDelete:"CASCADE",
            onUpdate:"CASCADE",
            allowNull:false },
          amount:
            {
              type:DataTypes.DECIMAL(10,2),
            allowNull:false},
          transaction_type:{type:DataTypes.STRING,
            allowNull:false},
            created_at: {
              type: DataTypes.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
              type: DataTypes.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            deleted_at: {
              type: DataTypes.DATE,
              allowNull: true,
            },
      }, {
        tableName: 'transaction_history',
        paranoid:true,
        underscored:true
      });
      return TransactionHistory;

}