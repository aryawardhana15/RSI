import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();

// Create auth plugin handlers
const createAuthPlugin = (pluginName: string) => {
  return () => {
    return (data: any, cb: any) => {
      if (!cb || typeof cb !== 'function') {
        return;
      }
      
      const password = process.env.DB_PASSWORD || process.env.DB_PASS || '';
      
      if (pluginName === 'mysql_native_password') {
        if (data && data.authPluginData && Buffer.isBuffer(data.authPluginData)) {
          try {
            const authData = data.authPluginData.slice(0, 20);
            const passwordBuffer = Buffer.from(password);
            const token = crypto.createHash('sha256')
              .update(Buffer.concat([passwordBuffer, authData]))
              .digest();
            cb(null, token);
          } catch (error) {
            cb(null, Buffer.from(password));
          }
        } else {
          cb(null, Buffer.from(password));
        }
      } else {
        // For other plugins like auth_gssapi_client, use password directly
        cb(null, Buffer.from(password));
      }
    };
  };
};

const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD || process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    dialectOptions: {
      // Handle authentication plugins
      authPlugins: {
        mysql_native_password: createAuthPlugin('mysql_native_password'),
        auth_gssapi_client: createAuthPlugin('auth_gssapi_client'),
      },
      connectTimeout: 60000,
      // Additional options for better connection stability
      ssl: false,
      reconnect: true,
    },
    // Retry configuration
    retry: {
      max: 3,
    },
  }
);

export default sequelize;