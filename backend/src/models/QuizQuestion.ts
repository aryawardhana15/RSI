import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface QuizQuestionAttributes {
  id: number;
  assignment_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'a' | 'b' | 'c' | 'd';
  order_index: number;
}

interface QuizQuestionCreationAttributes extends Optional<QuizQuestionAttributes, 'id'> {}

class QuizQuestion extends Model<QuizQuestionAttributes, QuizQuestionCreationAttributes> implements QuizQuestionAttributes {
  public id!: number;
  public assignment_id!: number;
  public question_text!: string;
  public option_a!: string;
  public option_b!: string;
  public option_c!: string;
  public option_d!: string;
  public correct_answer!: 'a' | 'b' | 'c' | 'd';
  public order_index!: number;
}

QuizQuestion.init(
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
    question_text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    option_a: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    option_b: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    option_c: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    option_d: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    correct_answer: {
      type: DataTypes.ENUM('a', 'b', 'c', 'd'),
      allowNull: false
    },
    order_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    sequelize,
    tableName: 'quiz_questions',
    timestamps: false
  }
);

export default QuizQuestion;

