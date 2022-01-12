exports.up = async (knex) => {
  await knex.schema.createTable('statistic', (table) => {
    table.uuid('id').primary();

    table.string('user').notNull();
    table.string('game').notNull();
    table.float('wagered').notNull();
    table.float('profit').notNull();
  });

  // create unique index for user and game
  await knex.raw(
    'create unique index user_game_unique_undex on statistic ("user", "game")'
  );
};

exports.down = async () => {};
