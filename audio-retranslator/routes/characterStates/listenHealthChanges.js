// const subscriptionName = 'rescue-service';
// const timeout = 60;

// // Imports the Google Cloud client library
// const { PubSub } = require('@google-cloud/pubsub');

// // Creates a client; cache this for further use
// const pubSubClient = new PubSub();

function listenHealthChanges(callback, simulateMessages = false) {
  // References an existing subscription
  // const subscription = pubSubClient.subscription(subscriptionName);

  // // Create an event handler to handle messages
  // let messageCount = 0;
  // const messageHandler = (message) => {
  //   console.log(`Received message ${message.id}:`);
  //   // console.log(`\tData: ${message.data}`);
  //   const parsedData = JSON.parse(message.data);
  //   console.log(`\tData: ${JSON.stringify(parsedData, null, '  ')}`);
  //   console.log(`\tAttributes: ${message.attributes}`);
  //   messageCount += 1;

  //   // "Ack" (acknowledge receipt of) the message
  //   message.ack();
  // };


  // // Listen for new messages until timeout is hit
  // subscription.on('message', messageHandler);

  if (simulateMessages) {
    let flag = true;
    setInterval(() => {
      callback({
        characterId: 10198,
        stateFrom: flag ? 'clinically_dead' : 'healthy',
        stateTo: !flag ? 'clinically_dead' : 'healthy',
      });
      flag = !flag;
    }, 3000);
  }
  // setTimeout(() => {
  //   subscription.removeListener('message', messageHandler);
  //   console.log(`${messageCount} message(s) received.`);
  // }, timeout * 1000);
}

exports.listenHealthChanges = listenHealthChanges;