export const typeDefs = `#graphql
  type Repo {
      name: String
      size: Int
      owner: String
  }

  type RepoDetails{
      name: String
      size: Int
      owner: String
      private: Boolean
      number_of_files: Int
      file_content: String
      active_webhooks: [String]
  }

  type Query {
      repos: [Repo]
      repoDetails(owner: String!, repo: String!): RepoDetails
  }
`;

export const resolvers = {
    Query: {
        repos: (parent, args, contextValue) =>
            contextValue.dataSources.githubController.getRepos(),
        repoDetails: (parent, args, contextValue) =>
            contextValue.dataSources.githubController.getRepoDetails(args),
    },
};
