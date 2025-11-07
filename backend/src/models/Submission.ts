import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SubmissionAttributes {
  id: number;
  assignment_id: number;
  user_id: number;
  answer_text?: string;
  file_url?: string;
  submitted_at?: Date;
  score?: number;
  feedback?: string;
  graded_at?: Date;
  graded_by?: number;
}

interface SubmissionCreationAttributes extends Optional<SubmissionAttributes, 'id'> {}

class Submission extends Model<SubmissionAttributes, SubmissionCreationAttributes> implements SubmissionAttributes {
  public id!: number;
  public assignment_id!: number;
  public user_id!: number;
  public answer_text?: string;
  public file_url?: string;
  public submitted_at!: Date;
  public score?: number;
  public feedback?: string;
  public graded_at?: Date;
  public graded_by?: number;
}

Submission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    assignment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'assignments',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    answer_text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    file_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    submitted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    graded_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    graded_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    tableName: 'submissions',
    timestamps: false
  }
);

export default Submission;

