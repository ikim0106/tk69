const auth = require('../auth.json')
const music = require('./music')

exports.resetBot = async function(message, client) {
    const msg = await message.channel.send('resetting...');
    await client.destroy();
    await client.login(auth.token);
    await msg.edit('resetted');
}

exports.help = async function(message) {
    let msg = `${auth.prefix}help is under construction. Available commands are: \n`
    msg+='\`'+Object.keys(music).join(', ')+'\`'
    message.reply(msg)
    console.log(Object.keys(this))
}