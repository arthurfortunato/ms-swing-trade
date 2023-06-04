import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class Migrate1685902591606 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'operations',
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
            name: 'ticket',
            type: 'varchar',
          },
          {
            name: 'total_purchase',
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
            name: 'sale_ticket_id',
            type: 'int',
          },
          {
            name: 'total_sale',
            type: 'decimal',
            precision: 19,
            scale: 2,
          },
          {
            name: 'gross_profit',
            type: 'decimal',
            precision: 19,
            scale: 2,
          },
          {
            name: 'irrf',
            type: 'decimal',
            precision: 19,
            scale: 4,
          },
          {
            name: 'darf',
            type: 'decimal',
            precision: 19,
            scale: 2,
          },
          {
            name: 'net_profit',
            type: 'decimal',
            precision: 19,
            scale: 2,
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
      'operations',
      new TableForeignKey({
        columnNames: ['purchase_ticket_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'purchase',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('operations', 'FK_operations_purchase');
    await queryRunner.dropColumn('operations', 'purchase_ticket_id');
    await queryRunner.dropTable('operations');
  }
}
