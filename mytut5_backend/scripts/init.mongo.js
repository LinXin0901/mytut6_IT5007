/*
 * Run using the mongo shell. For remote databases, ensure that the
 * connection string is supplied in the command line. For example:
 * localhost:
 *   mongo issuetracker scripts/init.mongo.js
 * Atlas:
 *   mongo mongodb+srv://user:pwd@xxx.mongodb.net/issuetracker scripts/init.mongo.js
 * MLab:
 *   mongo mongodb://user:pwd@xxx.mlab.com:33533/issuetracker scripts/init.mongo.js
 */

db.issues.remove({});

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

db.issues.insertMany(issuesDB);
const count = db.issues.count();
print('Inserted', count, 'issues');

db.counters.remove({ _id: 'issues' });
db.counters.insert({ _id: 'issues', current: count });


db.issues.createIndex({ id: 1 }, { unique: true });
db.issues.createIndex({ status: 1 });
db.issues.createIndex({ owner: 1 });
db.issues.createIndex({ created: 1 });