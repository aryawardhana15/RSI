import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MaterialProgressAttributes {
  id: number;
  user_id: number;
  material_id: number;
  is_completed: boolean;
  completed_at?: Date;
}

interface MaterialProgressCreationAttributes extends Optional<MaterialProgressAttributes, 'id' | 'is_completed'> {}

class MaterialProgress extends Model<MaterialProgressAttributes, MaterialProgressCreationAttributes> implements MaterialProgressAttributes {
  public id!: number;
  public user_id!: number;
  public material_id!: number;
  public is_completed!: boolean;
  public completed_at?: Date;
}

MaterialProgress.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    material_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'materials',
        key: 'id'
      }
    },
    is_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'material_progress',
    timestamps: false
  }
);

export default MaterialProgress;

