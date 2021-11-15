const fs = require('fs');
const express = require('express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost/issuetracker';
let db;

let aboutMessage = "Issue Tracker API v1.0";

const issuesDB = [
  {
    id: 1, name: 'Anna', phone: '84566920',
    timestamp: new Date('2018-08-15T20:59:09'),
  },
  {
    id: 2, name: 'Bob', phone: '23658237', 
    timestamp: new Date('2018-08-15T21:01:45'),
  },
  {
    id: 3, name: 'Cindy', phone: '94672587',  
    timestamp: new Date('2018-08-15T21:31:32'),
  }
];

var originalID = 4;

const GraphQLDate = new GraphQLScalarType({
  name: 'GraphQLDate',
  description: 'A Date() type in GraphQL as a scalar',
  serialize(value) {
    return value.toISOString();
  },
  parseValue(value) {
    const dateValue = new Date(value);
    return isNaN(dateValue) ? undefined : dateValue;
  },
  parseLiteral(ast) {
    if (ast.kind == Kind.STRING) {
      const value = new Date(ast.value);
      return isNaN(value) ? undefined : value;
    }
  },
});

const resolvers = {
  Query: {
    about: () => aboutMessage,
    issueList,
  },
  Mutation: {
    setAboutMessage,
    issueAdd,
    issueDelete,
  },
  GraphQLDate,
};

function setAboutMessage(_, { message }) {
  return aboutMessage = message;
}

async function issueList() {
  const issues = await db.collection('issues').find({}).toArray();
  return issues;
}

async function getNextSequence(name) {
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { current: 1 } },
    { returnOriginal: false },
  );
  return result.value.current;
}
  

function issueValidate(issue) {
  const errors = [];
  if (issue.name == '') {
    errors.push('Please input valid name!');
  }
  if (errors.length > 0) {
    throw new UserInputError('Invalid input(s)', { errors });
  }
}

async function issueAdd(_, { issue }) {
  issueValidate(issue);
  if (issuesDB.length == 25) {
    alert("There are no available slots in the waitlist!")
  } else {
    issue.id = originalID;
    originalID = originalID + 1;
    issue.timestamp = new Date();

    const result = await db.collection('issues').insertOne(issue);
    const savedIssue = await db.collection('issues').findOne({ _id: result.insertedId });
    return savedIssue;
  }
}

async function issueDelete(_, { issue }) {
  issueValidate(issue);
  await db.collection('issues').deleteOne({id:issue.id});
  return issue;
}

async function connectToDb() {
  const client = new MongoClient(url, { useNewUrlParser: true });
  await client.connect();
  console.log('Connected to MongoDB at', url);
  db = client.db();
}

const server = new ApolloServer({
  typeDefs: fs.readFileSync('./server/schema.graphql', 'utf-8'),
  resolvers,
  formatError: error => {
    console.log(error);
    return error;
  },
});

const app = express();

app.use(express.static('public'));

server.applyMiddleware({ app, path: '/graphql' });

(async function () {
  try {
    await connectToDb();
    app.listen(5000, function () {
      console.log('App started on port 5000');
    });
  } catch (err) {
    console.log('ERROR:', err);
  }
})();