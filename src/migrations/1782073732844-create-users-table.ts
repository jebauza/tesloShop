import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1782073732844 implements MigrationInterface {
  name = 'CreateUsersTable1782073732844';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying(100) NOT NULL,
                "password" character varying(255) NOT NULL,
                "full_name" character varying(255) NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "roles" text array NOT NULL DEFAULT '{user}',
                CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_users_email" ON "users" ("email")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."UQ_users_email"
        `);

    await queryRunner.query(`
            DROP TABLE "users"
        `);
  }
}
