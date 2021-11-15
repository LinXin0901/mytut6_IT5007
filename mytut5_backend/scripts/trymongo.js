const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost/issuetracker';

// Atlas URL  - replace UUU with user, PPP with password, XXX with hostname
// const url = 'mongodb+srv://UUU:PPP@cluster0-XXX.mongodb.net/issuetracker?retryWrites=true';

// mLab URL - replace UUU with user, PPP with password, XXX with hostname
// const url = 'mongodb://UUU:PPP@XXX.mlab.com:33533/issuetracker';

function testWithCallbacks(callback) {
  console.log('\n--- testWithCallbacks ---');
  const client = new MongoClient(url, { useNewUrlParser: true });
  client.connect(function(err, client) {
    if (err) {
      callback(err);
      return;
    }
    console.log('Connected to MongoDB');

    const db = client.db();
    const collection = db.collection('waitlists');

    const customer = { _id: 3, name: 'Cindy', phone: 23658237, timestamp: new Date('2018-08-15T20:59:09')};
    collection.insertOne(customer, function(err, result) {
      if (err) {
        client.close();
        callback(err);
        return;
      }
      console.log('Result of insert:\n', result.insertedId);
      collection.find({ _id: result.insertedId})
        .toArray(function(err, docs) {
        if (err) {
          client.close();
          callback(err);
          return;
        }
        console.log('Result of find:\n', docs);
        client.close();
        callback(err);
      });
    });
  });
}

async function testWithAsync() {
  console.log('\n--- testWithAsync ---');
  const client = new MongoClient(url, { useNewUrlParser: true });
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db();
    const collection = db.collection('waitlists');

    const customer = { _id: 1, name: 'Anna', phone: 84566920, timestamp: new Date('2018-08-15T21:01:45')};
    const result = await collection.insertOne(customer);
    console.log('Result of insert:\n', result.insertedId);

    const docs = await collection.find({ _id: result.insertedId })
      .toArray();
    console.log('Result of find:\n', docs);

    const customer_2 = { _id: 2, name: 'Bob', phone: 23658237, timestamp: new Date('2018-08-15T20:59:09')};
    const result_2 = await collection.insertOne(customer_2);
    await collection.updateOne({ _id: result_2.insertedId }, { $set: {phone: 11111111 } });
    const docs_2 = await collection.find({ _id: result_2.insertedId })
      .toArray();
    console.log('Result of update:\n', docs_2);

    const result_3 = await collection.find().toArray();
    console.log('Result before deletion:\n', result_3);
    await collection.deleteOne({ _id: 2 });
    const result_4 = await collection.find().toArray();
    console.log('Result after deletion:\n', result_4);
    
  } catch(err) {
    console.log(err);
  } finally {
    client.close();
  }
}

testWithCallbacks(function(err) {
  if (err) {
    console.log(err);
  }
  testWithAsync();
});