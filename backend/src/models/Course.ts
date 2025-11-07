import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CourseAttributes {
  id: number;
  mentor_id: number;
  title: string;
  description?: string;
  category?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  education_level?: 'SD' | 'SMP' | 'SMA' | 'Kuliah';
  price: number;
  thumbnail_url?: string;
  is_published: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface CourseCreationAttributes extends Optional<CourseAttributes, 'id' | 'is_published' | 'price'> {}

class Course extends Model<CourseAttributes, CourseCreationAttributes> implements CourseAttributes {
  public id!: number;
  public mentor_id!: number;
  public title!: string;
  public description?: string;
  public category?: string;
  public difficulty!: 'beginner' | 'intermediate' | 'advanced';
  public education_level?: 'SD' | 'SMP' | 'SMA' | 'Kuliah';
  public price!: number;
  public thumbnail_url?: string;
  public is_published!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Course.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    mentor_id: {
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    difficulty: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      defaultValue: 'beginner'
    },
    education_level: {
      type: DataTypes.ENUM('SD', 'SMP', 'SMA', 'Kuliah'),
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    thumbnail_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
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
    tableName: 'courses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default Course;

