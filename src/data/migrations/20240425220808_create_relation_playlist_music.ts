import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('relation_playlists_musics', (table) => {

        table.increments('id');
        table.bigInteger('playlistId')
            .unsigned()
            .index()
            .references('id')
            .inTable('playlists');
        table.bigInteger('musicId')
            .unsigned()
            .index()
            .references('id')
            .inTable('musics');
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('relation_playlists_musics');
}

