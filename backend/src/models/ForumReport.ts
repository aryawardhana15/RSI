import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ForumReportAttributes {
  id: number;
  reporter_id: number;
  forum_id?: number;
  reply_id?: number;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at?: Date;
  resolved_at?: Date;
  resolved_by?: number;
}

interface ForumReportCreationAttributes extends Optional<ForumReportAttributes, 'id' | 'status'> {}

class ForumReport extends Model<ForumReportAttributes, ForumReportCreationAttributes> implements ForumReportAttributes {
  public id!: number;
  public reporter_id!: number;
  public forum_id?: number;
  public reply_id?: number;
  public reason!: string;
  public status!: 'pending' | 'resolved' | 'dismissed';
  public readonly created_at!: Date;
  public resolved_at?: Date;
  public resolved_by?: number;
}

ForumReport.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    reporter_id: {
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
    reason: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'resolved', 'dismissed'),
      defaultValue: 'pending'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resolved_by: {
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
    tableName: 'forum_reports',
    timestamps: false
  }
);

export default ForumReport;

