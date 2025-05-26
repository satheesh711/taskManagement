import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DB_HOST = process.env.DB_HOST 
const DB_NAME = process.env.DB_NAME 
const DB_USER = process.env.DB_USER 
const DB_PASS = process.env.DB_PASS 
const DB_DIALECT = 'mysql';

console.log(`Connecting to database: ${DB_NAME} at ${DB_HOST} as user ${DB_USER}`);

// Create Sequelize instance
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  dialect: DB_DIALECT,
//   logging: process.env.NODE_ENV === 'development',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true, // Automatically add createdAt and updatedAt
    underscored: true, // Use snake_case rather than camelCase for columns
  }
});

export default sequelize;