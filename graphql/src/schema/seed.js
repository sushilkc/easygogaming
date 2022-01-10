const {
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLString,
} = require('graphql');

exports.Type = new GraphQLObjectType({
  name: 'Seed',
  fields: () => ({
    id: { type: GraphQLString },
    active: { type: GraphQLBoolean },
    secret: { type: GraphQLString },
    hash: { type: GraphQLString },
    nonce: { type: GraphQLInt },
  }),
});
