import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductsTable1782075121756 implements MigrationInterface {
  name = 'CreateProductsTable1782075121756';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "products" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying(100) NOT NULL,
                "price" double precision NOT NULL DEFAULT '0',
                "description" text,
                "slug" character varying(255) NOT NULL,
                "stock" smallint NOT NULL DEFAULT '0',
                "sizes" text array NOT NULL,
                "gender" character varying NOT NULL,
                "tags" text array NOT NULL DEFAULT '{}',
                "user_id" uuid,
                CONSTRAINT "PK_products_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_products_title" 
            ON "products" ("title")
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_products_slug" 
            ON "products" ("slug")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_products_user_id" 
            ON "products" ("user_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "products" 
            ADD CONSTRAINT "FK_products_user_id" 
            FOREIGN KEY ("user_id") 
            REFERENCES "users"("id") 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "products" 
            DROP CONSTRAINT "FK_products_user_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_products_user_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."UQ_products_slug"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."UQ_products_title"
        `);
    await queryRunner.query(`
            DROP TABLE "products"
        `);
  }
}
