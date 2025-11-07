import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ChatAttributes {
  id: number;
  pelajar_id: number;
  mentor_id: number;
  course_id: number | null;
  last_message_at?: Date;
  created_at?: Date;
}

interface ChatCreationAttributes extends Optional<ChatAttributes, 'id'> {}

class Chat extends Model<ChatAttributes, ChatCreationAttributes> implements ChatAttributes {
  public id!: number;
  public pelajar_id!: number;
  public mentor_id!: number;
  public course_id!: number | null;
  public last_message_at!: Date;
  public readonly created_at!: Date;
}

Chat.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    pelajar_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    mentor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    last_message_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'chats',
    timestamps: false
  }
);

export default Chat;


