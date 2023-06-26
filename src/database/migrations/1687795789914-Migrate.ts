import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class Migrate1687795789914 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'dividends',
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
            enum: ['DIVIDENDS', 'JRC'],
          },
          {
            name: 'payment_date',
            type: 'date',
          },
          {
            name: 'ticket',
            type: 'varchar',
          },
          {
            name: 'rate',
            type: 'decimal',
            precision: 19,
            scale: 4,
          },
          {
            name: 'quantity',
            type: 'int',
          },
          {
            name: 'total',
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
    await queryRunner.dropTable('dividends');
  }
}
