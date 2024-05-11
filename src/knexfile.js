require('ts-node').register();

// Update with your config settings.

module.exports = {
    client: 'sqlite3',
    connection: {
      filename: 'data/zik.db3',
    },
    useNullAsDefault: true,
    migrations: {
      directory: 'data/migrations',
    },
    seeds: {
      directory: 'data/seeds',
    }
};
