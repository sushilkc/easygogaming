const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
} = require('graphql');
const axios = require('axios');
const User = require('./user');
const Seed = require('./seed');
let seeds = {};
exports.Type = new GraphQLObjectType({
  name: 'DiceBet',
  fields: () => ({
    id: { type: GraphQLString },
    amount: { type: GraphQLFloat },
    payout: { type: GraphQLFloat },
    target: { type: GraphQLInt },
    result: { type: GraphQLInt },
    nonce: { type: GraphQLInt },
    user: {
      type: User.Type,
      resolve: ({ user }) => ({ name: user }),
    },
    seed: {
      type: Seed.Type,
      resolve: async ({ seed_id: seedId }) => {
        
        // return seed from seeds object if the result already exists for given seedId
        if(seeds[seedId]){
          return seeds[seedId];
        }
        
        const { data } = await axios.post(`http://dice/get-seed`, { seedId });
        // assign seed result to seeds object where key is seedId so that no need to query the seed for same seedId again
        seeds[seedId] = data; 
        return data;
      },
    },
  }),
});
