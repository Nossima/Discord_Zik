import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('musics', (table) => {

        table.increments('id');
        table.string('url', 255).notNullable();
        table.string('name', 255).unique();
        table.string('author', 255);
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('musics');
}

