import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ForumReplyAttributes {
  id: number;
  forum_id: number;
  user_id: number;
  content: string;
  likes_count: number;
  created_at?: Date;
  updated_at?: Date;
}

interface ForumReplyCreationAttributes extends Optional<ForumReplyAttributes, 'id' | 'likes_count'> {}

class ForumReply extends Model<ForumReplyAttributes, ForumReplyCreationAttributes> implements ForumReplyAttributes {
  public id!: number;
  public forum_id!: number;
  public user_id!: number;
  public content!: string;
  public likes_count!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ForumReply.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    forum_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'forums',
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    likes_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
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
    tableName: 'forum_replies',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default ForumReply;

