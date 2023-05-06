import createApolloServer from "./app.js";

createApolloServer({ port: 4000 }).then(({url}) => console.log(`🚀  Server ready at: ${url}`));