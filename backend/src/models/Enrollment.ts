import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface EnrollmentAttributes {
  id: number;
  user_id: number;
  course_id: number;
  enrolled_at?: Date;
  completed_at?: Date;
  progress: number;
}

interface EnrollmentCreationAttributes extends Optional<EnrollmentAttributes, 'id' | 'progress'> {}

class Enrollment extends Model<EnrollmentAttributes, EnrollmentCreationAttributes> implements EnrollmentAttributes {
  public id!: number;
  public user_id!: number;
  public course_id!: number;
  public enrolled_at!: Date;
  public completed_at?: Date;
  public progress!: number;
}

Enrollment.init(
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
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    enrolled_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  },
  {
    sequelize,
    tableName: 'enrollments',
    timestamps: false
  }
);

export default Enrollment;

