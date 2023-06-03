import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class Migrate1685666537269 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'sale',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'purchase_ticket_id',
            type: 'int',
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

    await queryRunner.createForeignKey(
      'sale',
      new TableForeignKey({
        columnNames: ['purchase_ticket_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'purchase',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('sale', 'FK_sale_purchase');
    await queryRunner.dropColumn('sale', 'purchase_ticket_id');
    await queryRunner.dropTable('sale');
  }
}
