import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDocumentTypeAndDocumentToUsersTable1782076810594 implements MigrationInterface {
  name = 'AddDocumentTypeAndDocumentToUsersTable1782076810594';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users" 
            ADD "document_type" character varying(100)
        `);
    await queryRunner.query(`
            ALTER TABLE "users" 
            ADD "document" text
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_users_full_name" 
            ON "users" ("full_name")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."IDX_users_full_name"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN "document"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN "document_type"
        `);
  }
}
