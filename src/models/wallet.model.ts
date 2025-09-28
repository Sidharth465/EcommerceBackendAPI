import { DataType,DataTypes,Sequelize } from "sequelize";

export const defineWalletModel = (sequelize:Sequelize) =>{

    const Wallet = sequelize.define('Wallet', {

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
            {type:DataTypes.DECIMAL(10,2),
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
              
    },
{
    tableName:'wallet',
    underscored:true,
    paranoid:true
})
return Wallet;
}