require('dotenv').config(); 
const Discord = require("discord.js");
const client = new Discord.Client();

const scrimPlayer = '749740102569295902';

const bot = new Discord.Client();

let scrimPlayerListObject = [];

bot.on('message', (message) => {
	let parts = message.content.split(' ');

	// !signin Command. Used to push a user's name, roles, and MMR to scrimPlayerList
	// Can be used by any user with access to allowed channels.
	if (parts[0] === '!signin') {
		if(parts.length !== 4) {
			message.reply("Your message was incorrectly formatted.\n`!signin {name} {mmr} {first_choice_role,second_choice_role,...}`");
			return;
		}
		let roles = parts[1].toString();
		roles = roles.split(',');
		let mmr = parts[2];
		mmr = parseInt(mmr, 10);
		let rolesValid = rolesValidCheck(roles, message);
		let mmrValid = mmrValidCheck(mmr, message);
        let username = message.member.user.tag;
        username = username.substring(0, username.indexOf('#'));
		let isSignedUp = isSignedUpCheck(username, message);
		if (rolesValid && mmrValid && isSignedUp) {
			message.member.roles.add(scrimPlayer);
			scrimPlayerListObject.push({Name: username, Roles: roles, MMR: mmr});
			let scrimPlayerList = 'Scrim Player List: \n';
			scrimPlayerListObject.forEach( e =>
				scrimPlayerList = scrimPlayerList.concat(`${e.Name}:\t\t\t\tRoles: ${e.Roles}\t\t\t\tMMR: ${e.MMR}\n`)
			);
			message.reply(scrimPlayerList);
		}
	}
	// !clearScrimPlayerList Command. Used to set scrimPlayerList to [].
	// Can be used only by users with the BAN_MEMBERS permission.
	else if (parts[0] === '!clearScrimPlayerList') {

		if (message.member.hasPermission("BAN_MEMBERS")) {
			scrimPlayerList = `Scrim Player List: \n`;
			message.reply(`The Scrim Player List has been cleared.`);
		}
	}
	// !listScrimPlayers Command. Used to make the Scrim Bot list players in discord chat.
	// Can be used by any user with access to allowed channels.
	else if (parts[0] === '!listScrimPlayers'){
		let scrimPlayerList = 'Scrim Player List: \n';
		scrimPlayerListObject.forEach( e =>
			scrimPlayerList = scrimPlayerList.concat(`${e.Name}:\t\t\t\tRoles: ${e.Roles}\t\t\t\tMMR: ${e.MMR}\n`)
		);
		//scrimPlayerList = scrimPlayerList.concat(`${username}:\t\tRoles: ${roles}\t\tMMR: ${mmr}\n`)
		message.reply(`${scrimPlayerList}`)
	}
	// !signout Command. Used to make the Scrim Bot sign a player out.
	// Can be used by any user with access to allowed channels.
	else if (parts[0] === '!signout'){
		let username = message.member.user.tag;
		if (scrimPlayerListObject.find(x => x.Name === username)) {
			scrimPlayerListObject = scrimPlayerListObject.filter(x => x.Name != username);
			message.reply('You have been signed out');
			console.log(scrimPlayerListObject);
		} else {
			message.reply('You were not signed in.');
		}
	}
});
//Bot Login, to replace login key visit discordapp.com developer page.
bot.login(process.env.DISCORD_TOKEN);


function rolesValidCheck(rolesArray, message) {
	if (rolesArray.length <= 1) {
		message.reply('Make sure you select more than one role. (e.g. 1,2)');
		return false;
	}
	if (!rolesArray.every(e => e >= 1 && e <= 5)) {
		message.reply('Make sure you input valid roles (1,2,3,4,5)');
		return false;
	}
	if (new Set(rolesArray).size !== rolesArray.length) {
		message.reply('Make sure you enter no duplicate roles');
		return false;
	}
	return true;
}

function mmrValidCheck(mmrNumber, message) {
	if (isNaN(mmrNumber)) {
		message.reply('Make sure your mmr is a number. (e.g. 4000)');
		return false;
	}
	return true;
}

function isSignedUpCheck(username, message) {
	if (scrimPlayerListObject.find(x => x.Name === username)) {
		message.reply('You are already signed in. Sign out and sign back in to change settings.');
		return false;
	}
	return true;
}

/*const exampleEmbed = new Discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle('Scrim Player List')
	.setDescription(`${scrimPlayerList}`)
	.setThumbnail('https://static-cdn.jtvnw.net/ttv-boxart/Dota%202-144x192.jpg')
	.setTimestamp();*/