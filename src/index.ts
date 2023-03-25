import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import { typeDefs, resolvers } from "./schema.js";
import githubController from "./git-controller.js";

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(
    "/",
    cors(),
    bodyParser.json({ limit: "50mb" }),
    expressMiddleware(server, {
        context: async ({ req }) => ({
            dataSources: {
                githubController: new githubController(req.headers.token as string),
            },
        }),
    })
);

httpServer.listen({ port: 4000 }, () => {
    console.log(`🚀 Server ready at http://localhost:4000/`);
});
