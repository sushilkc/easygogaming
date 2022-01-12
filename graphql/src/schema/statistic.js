const { GraphQLObjectType, GraphQLFloat, GraphQLString } = require('graphql');

exports.Type = new GraphQLObjectType({
  name: 'Statistic',
  fields: () => ({
    id: { type: GraphQLString },
    game: { type: GraphQLString },
    wagered: { type: GraphQLFloat },
    profit: { type: GraphQLFloat },
  }),
});
