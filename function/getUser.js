const client = require("../db/client");

const getUser = async (discordId, data) => {
  await client.connect();

  let user = await client.get(discordId);

  if (!user && !data) {
    await client.disconnect();
    return true;
  }

  if (!data && user) {
    user = JSON.parse(user);
    let date = user["date-time"];
    date = new Date(date);
    let currentDate = new Date();
    let diff = currentDate - date;
    if (diff < 86400000) {
      if (user.amount > 50) {
        await client.disconnect();
        return {
          status: 503,
          amount: user.amount,
        };
      }
    } else {
      console.log("resetting");
      user.amount = 0;
      await client.set(discordId, JSON.stringify(user));
      await client.disconnect();
    }
    await client.disconnect();
    return {
      status: 200,
      amount: user.amount,
    }
  }

  if (!user && data) {
    await client.set(discordId, JSON.stringify(data));
    await client.disconnect();
    return true;
  }

  if (user && data) {
    user = JSON.parse(user);
    user.amount += data.amount;
    await client.set(discordId, JSON.stringify(user));
    await client.disconnect();
  }
};

module.exports = getUser;
