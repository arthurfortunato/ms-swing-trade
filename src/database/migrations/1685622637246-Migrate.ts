import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class Migrate1685622637246 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'stock_registration',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['PURCHASE', 'SALE'],
          },
          {
            name: 'operation_date',
            type: 'date',
          },
          {
            name: 'ticket',
            type: 'varchar',
          },
          {
            name: 'value',
            type: 'decimal',
            precision: 19,
            scale: 2,
          },
          {
            name: 'quantity',
            type: 'int',
          },
          {
            name: 'tax',
            type: 'decimal',
            precision: 19,
            scale: 2,
          },
          {
            name: 'total_operation',
            type: 'decimal',
            precision: 19,
            scale: 2,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('stock_registration');
  }
}
