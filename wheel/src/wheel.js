const _ = require('lodash');
const crypto = require('crypto');
const { v4: uuid } = require('uuid');
const assert = require('assert');
const { knex } = require('./knex');
const { redis } = require('./redis');

const parseSeed = (seed) => {
    if (!seed) {
        return null;
    }

    if (seed.active) {
        return _.omit(seed, ['secret']);
    }

    return seed;
};

// segments
const segments = [1.50, 1.20, 0.00, 1.20, 1.20, 1.20, 1.20, 0.00, 1.20, 1.20];

// spin wheel
exports.spinWheel = ({ user, amount }) =>
    knex.transaction(async (trx) => {
        assert(amount >= 0);

        let [seed] = await trx('seed').where({ user, active: true }).forUpdate();

        if (!seed) {
            const secret = crypto.randomBytes(32).toString('hex');
            const hash = crypto.createHash('sha256').update(secret).digest('hex');

            // ignore on duplicate
            const query = `insert into "seed" 
              ("id", "user", "secret", "hash", "nonce", "active") values 
              (:id, :user, :secret, :hash, :nonce, :active) 
              on conflict ("user") where active = true do nothing`;
            await trx.raw(query,
                { id: uuid(), user, secret, hash, nonce: 0, active: true }
            );

            [seed] = await trx('seed').where({ user, active: true }).forUpdate();
        }

        const nonce = String(seed.nonce + 1);

        const hmac = crypto
            .createHmac('sha256', seed.secret)
            .update(nonce)
            .digest('hex');

        // we take the first 32 bits (4 bytes, 8 hex chars)
        const int = parseInt(hmac.substr(0, 8), 16);
        const float = int / 2 ** 32;

        const result = Math.floor(float * 10);

        const segment = segments[result];

        const isWin = segment > 0;

        // 0.99 applies our house edge of 1%
        const payout = isWin ? (amount * segment) * 0.99 : 0;
        
        const [bet] = await trx('bet')
          .insert({
            id: uuid(),
            seed_id: seed.id,
            user,
            amount,
            payout,
            result,
            segment,
            nonce,
          })
          .returning('*');

        await trx('seed')
          .update('nonce', trx.raw('nonce + 1'))
          .where('id', seed.id);

        await redis.publish('wheel', JSON.stringify(bet));

        return bet;
    });

// get bets
exports.getBets = async ({ user, limit, offset }) => {
    const bets = await knex('bet')
        .where('user', user)
        .orderBy('bet.created_at', 'desc')
        .limit(limit)
        .offset(offset);

    return bets;
};

// get seed
exports.getSeed = async ({ seedId }) => {
    const [seed] = await knex('seed').where('id', seedId);
    return parseSeed(seed);
};

// rotate seed
exports.rotateSeed = async ({ user }) => {
    const [seed] = await knex('seed')
        .update({ active: false })
        .where({ user, active: true })
        .returning('*');

    return parseSeed(seed);
};

// get active seed
exports.getActiveSeed = async ({ user }) => {
    const [seed] = await knex('seed').where({ user, active: true });
    return parseSeed(seed);
};
