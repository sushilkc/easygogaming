/* eslint-disable no-unused-expressions */
const _ = require('lodash');
const { expect } = require('chai');
const { rollDice } = require('./dice');
const { knex } = require('./knex');

describe('dice', () => {
  before(async () => {
    await knex.migrate.latest();
  });

  it('rolls the dice', async () => {
    const bet = await rollDice({ user: 'test', amount: 0.1, target: 50 });
    expect(bet).to.be.ok;
  });

  it('used nonce in order', async () => {
    let bets = await Promise.all(
      _.range(5).map(() => rollDice({ user: 'test', amount: 0.1, target: 50 }))
    );

    // lets sort them in case bets get returned out of order
    bets = bets.sort((a, b) => a.nonce - b.nonce);

    let [{ nonce: nextNonce }] = bets;

    for (const bet of bets) {
      expect(bet.nonce).to.equal(nextNonce);
      nextNonce += 1;
    }
  });
});
