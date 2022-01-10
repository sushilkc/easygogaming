const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLFloat,
  GraphQLNonNull,
} = require('graphql');
const axios = require('axios');
const DiceBet = require('./dice-bet');
const Seed = require('./seed');

exports.Type = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    rollDice: {
      type: DiceBet.Type,
      args: {
        target: { type: GraphQLNonNull(GraphQLInt) },
        amount: { type: GraphQLNonNull(GraphQLFloat) },
      },
      async resolve(parent, { amount, target }, { user }) {
        const { data } = await axios.post(`http://dice/roll-dice`, {
          user,
          amount,
          target,
        });
        return data;
      },
    },

    rotateDiceSeed: {
      type: Seed.Type,
      async resolve(parent, args, { user }) {
        const { data } = await axios.post(`http://dice/rotate-seed`, {
          user,
        });

        return data;
      },
    },
  }),
});
