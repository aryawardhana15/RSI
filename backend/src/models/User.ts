import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'pelajar' | 'mentor' | 'admin';
  bio?: string;
  photo_url?: string;
  cv_url?: string;
  expertise?: string;
  experience?: string;
  is_verified: boolean;
  is_suspended: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'is_verified' | 'is_suspended'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: 'pelajar' | 'mentor' | 'admin';
  public bio?: string;
  public photo_url?: string;
  public cv_url?: string;
  public expertise?: string;
  public experience?: string;
  public is_verified!: boolean;
  public is_suspended!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('pelajar', 'mentor', 'admin'),
      allowNull: false
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    photo_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    cv_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    expertise: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    experience: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_suspended: {
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
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default User;

