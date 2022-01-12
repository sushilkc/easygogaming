const { v4: uuid } = require('uuid');
const { knex } = require('./knex');

exports.updateStatistic = async ({ user, amount, payout }, game) => {
  await knex.raw(
    `
      insert into statistic (
        "id", "user", "game", "wagered", "profit"
      ) values (
        :id, :user, :game, :wagered, :profit
      )
      on conflict ("user", "game") do  update
      set 
      wagered = statistic.wagered + :wagered,
      profit = statistic.profit + :profit
    `,
    {
      id: uuid(),
      user,
      game,
      wagered: amount,
      profit: payout - amount,
    }
  );
};

// get statistic by game
exports.getStatistic = async ({ user, game }) => {
  const [statistic] = await knex('statistic').where({user, game});
  return statistic;
};

// get all statistics
exports.getStatistics = async ({ user }) => {
  const statistic = await knex('statistic').where('user', user);
  return statistic;
};