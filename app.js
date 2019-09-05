const config = require("./config.json")

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const db = low(new FileSync('./db.json'))

const login = require("facebook-chat-api");

if (!db.has("created").value()) {
  config.users.map(user => db.set(user, 0).write())
  db.set("created", true).write()
}

login({ email: config.email, password: config.password }, (err, api) => {
    if(err) return console.error(err);

    const myID = api.getCurrentUserID()

    api.listen((err, message) => {
      console.log(message)
      if (message.mentions.hasOwnProperty(myID)) {
        let messageArray = message.body.split(" ")
        let operator = messageArray[2]
        let increment = parseInt(messageArray[3])
        let name = messageArray[4]

        switch (operator) {
          case "help":
            api.sendMessage("Usage: @Bot Bot add/minus/help/scores 'number' 'name'", message.threadID);
            break;
          case "scores":
            config.users.map(user => api.sendMessage(user + ": " + db.get(user).value(), message.threadID))
            break;
          case "add":
            db.update(name, score => score + increment).write()
            api.sendMessage(name + "'s score is now " + db.get(name).value(), message.threadID);
            break;
          case "minus":
            db.update(name, score => score - increment).write()
            api.sendMessage(name + "'s score is now " + db.get(name).value(), message.threadID);
            break;
          default:
            api.sendMessage("I don't understand", message.threadID);
        }
      }
    });

    console.log("here")
});
