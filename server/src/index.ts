import { ApolloServer } from "@apollo/server";
import { InMemoryLRUCache } from "@apollo/utils.keyvaluecache";

// #graphql generates syntax highlight in comment
// These are the typeDefs or our graphQl schema
const typeDefs = `#graphql

    type Book {
      id: ID!
      title: String
      author: Author
    }
    type Author {
      userId: ID!
      firstName: String
      lastName: String
    }
    input AuthorRequest {
      firstName: String 
      lastName: String
    }
    input BookRequest {
      title: String
      author: AuthorRequest
    }

    type Query {
      books: [Book]
      authors: [Author]
      author(id: ID!): Author
    }

    type Mutation{
      createBook(request: BookRequest): Book  
    }
`;

type Book = {
  id: Number;
  author: Author;
  title: String;
};

type Author = {
  userId: number;
  firstName: String;
  lastName: String;
};
const books: Array<Book> = [
  {
    id: 0,
    author: {
      firstName: "Aayush",
      lastName: "Vyas",
      userId: 12312,
    },
    title: "Gang of Four",
  },
  {
    id: 1,
    author: {
      firstName: "Pranav",
      lastName: "Vyas",
      userId: 59684,
    },
    title: "Typescript the best",
  },
];

const authors: Array<Author> = [
  {
    userId: 52,
    firstName: "Aayush",
    lastName: "Vyas",
  },
  {
    userId: 78,
    firstName: "Pranav",
    lastName: "Vyas",
  },
];

// Resolver
// How to fetch data associated with a particular type
let totalCalls = 0;
const resolvers = {
  Book: {
    author: (book) => {
      console.log("Nested query", book.id);
      return authors.at(book.id);
    },
  },
  Query: {
    // when this query is called , then do this
    books: () => {
      totalCalls++;
      console.log(`Total Calls ${totalCalls}`);
      return books;
    },
    author: (parent, { id }) => {
      totalCalls++;
      console.log("Recevied: ", id);
      return authors.at(id);
    },
  },
  Mutation: {
    createBook: (_, input) => {
      console.log(input);
      let book: Book = {
        title: input.request.title,
        author: { firstName: " Ayu", lastName: "y", userId: 0 },
        id: 0,
      };
      return book;
    },
  },
};

import bodyParser from "body-parser";
import express from "express";
import cors from "cors";
import { expressMiddleware } from "@apollo/server/express4";

const startServer = async () => {
  const app = express();
  const server = new ApolloServer({
    csrfPrevention: false,
    typeDefs: typeDefs,
    resolvers: resolvers,
  });
  app.use(bodyParser.json());
  app.use(cors({ origin: "*" }));
  await server.start();
  app.get("/health", (req, res) => {
    console.log("received");
    res.send("Ok");
  });

  app.use("/graphql", expressMiddleware(server));

  app.listen(8000, () => {
    console.log("server started .....");
  });
};

startServer();
