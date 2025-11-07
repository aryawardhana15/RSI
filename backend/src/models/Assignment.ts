import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AssignmentAttributes {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  type: 'tugas' | 'kuis';
  deadline?: Date;
  max_score: number;
  created_at?: Date;
  updated_at?: Date;
}

interface AssignmentCreationAttributes extends Optional<AssignmentAttributes, 'id' | 'max_score'> {}

class Assignment extends Model<AssignmentAttributes, AssignmentCreationAttributes> implements AssignmentAttributes {
  public id!: number;
  public course_id!: number;
  public title!: string;
  public description?: string;
  public type!: 'tugas' | 'kuis';
  public deadline?: Date;
  public max_score!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Assignment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('tugas', 'kuis'),
      allowNull: false
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true
    },
    max_score: {
      type: DataTypes.INTEGER,
      defaultValue: 100
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'assignments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default Assignment;

