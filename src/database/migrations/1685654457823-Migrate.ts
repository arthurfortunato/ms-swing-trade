import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { Migrate1685622637246 } from './1685622637246-Migrate';

export class Migrate1685654457823
  extends Migrate1685622637246
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'purchase',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['OPEN', 'CLOSE'],
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('purchase');
  }
}
