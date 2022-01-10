const { v4: uuid } = require('uuid');
const { knex } = require('./knex');

exports.updateStatistic = async ({ user, amount, payout }) => {
  await knex.raw(
    `
      insert into statistic (
        "id", "user", "wagered", "profit"
      ) values (
        :id, :user, :wagered, :profit
      )
      on conflict ("user") do  update
      set 
      wagered = statistic.wagered + :wagered,
      profit = statistic.profit + :profit
    `,
    {
      id: uuid(),
      user,
      wagered: amount,
      profit: payout - amount,
    }
  );
};

exports.getStatistic = async ({ user }) => {
  const [statistic] = await knex('statistic').where('user', user);
  return statistic;
};
