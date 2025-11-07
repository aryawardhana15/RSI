import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ForumAttributes {
  id: number;
  course_id: number;
  user_id: number;
  title: string;
  content: string;
  tags?: string;
  is_pinned: boolean;
  is_locked: boolean;
  likes_count: number;
  replies_count: number;
  created_at?: Date;
  updated_at?: Date;
}

interface ForumCreationAttributes extends Optional<ForumAttributes, 'id' | 'is_pinned' | 'is_locked' | 'likes_count' | 'replies_count'> {}

class Forum extends Model<ForumAttributes, ForumCreationAttributes> implements ForumAttributes {
  public id!: number;
  public course_id!: number;
  public user_id!: number;
  public title!: string;
  public content!: string;
  public tags?: string;
  public is_pinned!: boolean;
  public is_locked!: boolean;
  public likes_count!: number;
  public replies_count!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Forum.init(
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
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    tags: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_pinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_locked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    likes_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    replies_count: {
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
    tableName: 'forums',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default Forum;

