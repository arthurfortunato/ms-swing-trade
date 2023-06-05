import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';
import { Migrate1685622637246 } from './1685622637246-Migrate';

export class Migrate1685666537269
  extends Migrate1685622637246
  implements MigrationInterface
{
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
            name: 'irrf',
            type: 'decimal',
            precision: 19,
            scale: 4,
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
