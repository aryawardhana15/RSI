import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ForumLikeAttributes {
  id: number;
  user_id: number;
  forum_id?: number;
  reply_id?: number;
  created_at?: Date;
}

interface ForumLikeCreationAttributes extends Optional<ForumLikeAttributes, 'id'> {}

class ForumLike extends Model<ForumLikeAttributes, ForumLikeCreationAttributes> implements ForumLikeAttributes {
  public id!: number;
  public user_id!: number;
  public forum_id?: number;
  public reply_id?: number;
  public readonly created_at!: Date;
}

ForumLike.init(
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
    forum_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'forums',
        key: 'id'
      }
    },
    reply_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'forum_replies',
        key: 'id'
      }
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'forum_likes',
    timestamps: false
  }
);

export default ForumLike;

