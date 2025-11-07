import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface QuizAnswerAttributes {
  id: number;
  submission_id: number;
  question_id: number;
  selected_answer: 'a' | 'b' | 'c' | 'd';
  is_correct?: boolean;
}

interface QuizAnswerCreationAttributes extends Optional<QuizAnswerAttributes, 'id' | 'is_correct'> {}

class QuizAnswer extends Model<QuizAnswerAttributes, QuizAnswerCreationAttributes> implements QuizAnswerAttributes {
  public id!: number;
  public submission_id!: number;
  public question_id!: number;
  public selected_answer!: 'a' | 'b' | 'c' | 'd';
  public is_correct?: boolean;
}

QuizAnswer.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    submission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'submissions',
        key: 'id'
      }
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'quiz_questions',
        key: 'id'
      }
    },
    selected_answer: {
      type: DataTypes.ENUM('a', 'b', 'c', 'd'),
      allowNull: false
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'quiz_answers',
    timestamps: false
  }
);

export default QuizAnswer;

