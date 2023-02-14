const auth = require('../auth.json')

exports.resetBot = async function(message, client) {
    const msg = await message.channel.send('resetting...');
    await client.destroy();
    await client.login(auth.token);
    await msg.edit('resetted');
}