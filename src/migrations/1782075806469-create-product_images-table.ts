import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductImagesTable1782075806469 implements MigrationInterface {
  name = 'CreateProductImagesTable1782075806469';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "product_images" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "url" character varying(255) NOT NULL,
                "product_id" uuid,
                CONSTRAINT "PK_product_images_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(
      `CREATE INDEX "IDX_product_images_user_id" ON "product_images" ("product_id")`,
    );
    await queryRunner.query(`
            ALTER TABLE "product_images" 
            ADD CONSTRAINT "FK_product_images_product_id" 
            FOREIGN KEY ("product_id") 
            REFERENCES "products"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_images" DROP CONSTRAINT "FK_product_images_product_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_product_images_user_id"`);
    await queryRunner.query(`DROP TABLE "product_images"`);
  }
}
