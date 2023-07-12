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
    msg+='\nPlease visit the following link for the documentation on the commands: <https://github.com/ikim0106/tk69/wiki/Music-commands>'
    msg+='\nNote: Music commands currently only support Youtube. Spotify support is coming soon!\n'
    const rep = await message.reply(msg)
}