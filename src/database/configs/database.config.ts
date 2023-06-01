import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';

export const API_SRC_ROOT = `${__dirname}/../..`;

export const config: DataSourceOptions = {
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: Number.parseInt(process.env.MYSQL_PORT, 10) ?? 3306,
  username: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  entities: [`${API_SRC_ROOT}/entities/*.entity{.ts,.js}`],
  synchronize: true,
  migrationsTableName: 'migrations',
  migrations: [`${API_SRC_ROOT}/database/migrations/*.ts`],
};

export const dataSource = new DataSource(config);
