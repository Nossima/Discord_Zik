import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('playlists', (table) => {

        table.increments('id');
        table.string('name', 255).unique().notNullable();
        table.string('author', 255).notNullable();
        table.boolean('collaborative').notNullable().defaultTo(true);
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('playlists');
}

