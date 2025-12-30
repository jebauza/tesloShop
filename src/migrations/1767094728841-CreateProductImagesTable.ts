import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateProductImagesTable1767094728841 implements MigrationInterface {
    name = 'CreateProductImagesTable1767094728841'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "product_images",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "url",
                    type: "text"
                },
                {
                    name: "product_id",
                    type: "uuid", // Debe coincidir con el tipo de ID de la tabla Product
                    isNullable: false
                }
            ]
        }), true);

        await queryRunner.createForeignKey("product_images", new TableForeignKey({
            columnNames: ["product_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "products",
            onDelete: "CASCADE"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("product_images");
        
        if (table) {
            const foreignKey = table.foreignKeys.find(
                (fk) => fk.columnNames.indexOf("product_id") !== -1
            );
            if (foreignKey) {
                await queryRunner.dropForeignKey("product_images", foreignKey);
            }
        }
        
        await queryRunner.dropTable("product_images");
    }

}
