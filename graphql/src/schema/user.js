const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull
} = require('graphql');
const axios = require('axios');
const DiceBet = require('./dice-bet');
const Seed = require('./seed');
const Statistic = require('./statistic');
const WheelBet = require('./wheel-bet');

exports.Type = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    name: { type: GraphQLString },
    statistic: { // get statistic per game per user
      type: Statistic.Type,
      args: {
        game: { type: GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, { game }, { user }) {
        const { data } = await axios.post(`http://statistic/get-statistic`, {
          user,
          game,
        });
        return data;
      },
    },
    statistics: { // get statistics of all game per user
      type: new GraphQLList(Statistic.Type),
      resolve: async ({ name: user }) => {
        const { data } = await axios.post('http://statistic/get-statistics', {
          user,
        });
        return data;
      },
    },
    diceBets: {
      type: new GraphQLList(DiceBet.Type),
      args: {
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt },
      },
      async resolve({ name: user }, { limit = 10, offset = 0 }) {
        const { data } = await axios.post('http://dice/get-bets', {
          user,
          limit,
          offset,
        });
        return data;
      },
    },
    activeDiceSeed: {
      type: Seed.Type,
      resolve: async ({ name: user }) => {
        const { data } = await axios.post('http://dice/get-active-seed', {
          user,
        });
        return data;
      },
    },
    wheelBets: { // get wheel bets
      type: new GraphQLList(WheelBet.Type),
      args: {
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt },
      },
      async resolve({ name: user }, { limit = 10, offset = 0 }) {
        const { data } = await axios.post('http://wheel/get-bets', {
          user,
          limit,
          offset,
        });
        return data;
      },
    },
    activeWheelSeed: { // get active wheel seed
      type: Seed.Type,
      resolve: async ({ name: user }) => {
        const { data } = await axios.post('http://wheel/get-active-seed', {
          user,
        });
        return data;
      },
    },
  }),
});
