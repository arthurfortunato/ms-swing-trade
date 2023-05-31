import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';

const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  username: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.DATABASE,
  entities: ['src/entities/*.ts'],
  migrations: ['src/database/migrations/*.ts'],
  logging: false,
  synchronize: true,
};

export const AppDataSource: DataSource = new DataSource(dataSourceOptions);
