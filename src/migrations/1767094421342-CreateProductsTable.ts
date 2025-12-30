import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateProductsTable1767094421342 implements MigrationInterface {
    name = 'CreateProductsTable1767094421342'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "products",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "uuid_generate_v4()"
                },
                {
                    name: "title",
                    type: "text",
                    isUnique: true
                },
                {
                    name: "price",
                    type: "float",
                    default: 0
                },
                {
                    name: "description",
                    type: "text",
                    isNullable: true
                },
                {
                    name: "slug",
                    type: "text",
                    isUnique: true
                },
                {
                    name: "stock",
                    type: "smallint",
                    default: 0
                },
                {
                    name: "sizes",
                    type: "text",
                    isArray: true
                },
                {
                    name: "gender",
                    type: "text"
                },
                {
                    name: "tags",
                    type: "text",
                    isArray: true,
                    default: "'{}'"
                },
                {
                    name: "user_id",
                    type: "uuid",
                    isNullable: true
                }
            ]
        }), true);

        await queryRunner.createForeignKey("products", new TableForeignKey({
            columnNames: ["user_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "SET NULL" 
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("products");
        
        if (table) {
            const foreignKey = table.foreignKeys.find(
                (fk) => fk.columnNames.indexOf("user_id") !== -1
            );
            
            if (foreignKey) {
                await queryRunner.dropForeignKey("products", foreignKey);
            }
        }

        await queryRunner.dropTable("products");
    }

}
