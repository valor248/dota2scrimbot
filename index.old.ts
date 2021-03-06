require('dotenv').config(); 
const Discord = require("discord.js");
const client = new Discord.Client();
let Tokens;
try{
	Tokens = require("./TOKENS.json");
}catch(e){}

const scrimPlayer = '749740102569295902';

const bot = new Discord.Client();

interface ScrimPlayer{
	Name: string;
	Roles: number[];
	MMR: number;
}

let scrimPlayerListObject: ScrimPlayer[] = [];

bot.on('message', (message: any) => {
	let parts: string[] = message.content.split(' ');

	// !signin Command. Used to push a user's name, roles, and MMR to scrimPlayerList
	// Can be used by any user with access to allowed channels.
	if (parts[0] === '!signin') {
		if(parts.length !== 3) {
			message.reply("Your message was incorrectly formatted.\n`!signin {first_choice_role,second_choice_role,...} {mmr}`");
			return;
		}
		let roles = parts[1].split(',').map(x => +x);
		let mmr = +parts[2];
		let rolesValid = rolesValidCheck(roles, message);
		let mmrValid = mmrValidCheck(mmr, message);
        let username: string = message.member.user.tag;
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
	else if (parts[0] === '!clearList') {

		if (message.member.hasPermission("BAN_MEMBERS")) {
            scrimPlayerListObject = [];
			message.reply(`The Scrim Player List has been cleared.`);
		} else {
            message.reply(`You do not have permission to use this command.`);
        }
    }
    else if (parts[0] === '!signinManual') {
        if (message.member.hasPermission("BAN_MEMBERS")) {
            if(parts.length !== 4) {
                message.reply("Your message was incorrectly formatted.\n`!signinManual {name} {first_choice_role,second_choice_role,...} {mmr}`");
                return;
            }
            let roles = parts[2].split(',').map(x => +x);
            let mmr = +parts[3];
            let rolesValid = rolesValidCheck(roles, message);
            let mmrValid = mmrValidCheck(mmr, message);
            let username = parts[1];
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
		} else {
            message.reply(`You do not have permission to use this command.`);
        }
	}
	// !listScrimPlayers Command. Used to make the Scrim Bot list players in discord chat.
	// Can be used by any user with access to allowed channels.
	else if (parts[0] === '!list'){
		let scrimPlayerList = 'Scrim Player List: \n';
		scrimPlayerList += prettyPrintTable([['Name', 'Roles', 'MMR'], ...scrimPlayerListObject.map(x => [x.Name, x.Roles.map(x => x.toString()).reduce((a,b) => a + ',' + b), x.MMR.toString()])]);
		// scrimPlayerListObject.forEach( e =>
		// 	scrimPlayerList = scrimPlayerList.concat(`${e.Name}:\t\t\t\tRoles: ${e.Roles}\t\t\t\tMMR: ${e.MMR}\n`)
		// );
		//scrimPlayerList = scrimPlayerList.concat(`${username}:\t\tRoles: ${roles}\t\tMMR: ${mmr}\n`)
		message.reply(scrimPlayerList);
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
bot.login(Tokens ? Tokens.DISCORD : process.env.DISCORD_TOKEN);


function rolesValidCheck(rolesArray: number[], message: any) {
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

function mmrValidCheck(mmrNumber: any, message: any) {
	if (isNaN(mmrNumber)) {
		message.reply('Make sure your mmr is a number. (e.g. 4000)');
		return false;
	}
	return true;
}

function isSignedUpCheck(username: any, message: any) {
	if (scrimPlayerListObject.find(x => x.Name === username)) {
		message.reply('You are already signed in. Sign out and sign back in to change settings.');
		return false;
	}
	return true;
}

/**
 * gets a pretty ascii table
 * @param {string[][]} table 
 */
function prettyPrintTable(table: string[][], columnDelimeter = '   '): string
{
	const maxLength = table[0].map(x => x.length);

	for(let i = table.length - 1; i >= 1; i--) {
		const current = table[i];
		for(let j = current.length - 1; j >= 0; j--) {
			if(maxLength[j] === undefined || current[j].length > maxLength[j]) {
				maxLength[j] = current[j].length;
			}
		}
	}

	console.log(maxLength);

	const paddedTable = table.map(x => x.map((s, i) => s.padEnd(maxLength[i])));


	function getString(row: number, col: number): string
	{
		return paddedTable[row][col] || ''.padStart(maxLength[col]);
	}


	let outputString = getString(0, 0);
	for(let i = 1; i < paddedTable[0].length; i++) {
		outputString += columnDelimeter + getString(0, i);
	}
	outputString += '\n';
	outputString += ''.padStart(maxLength.reduce((a,b)=> a + b) + columnDelimeter.length * (maxLength.length - 1), '-');
	for(let i = 1; i < table.length; i++) {
		outputString += '\n';
		outputString += getString(i, 0);
		for(let j = 1; j < table[i].length; j++) {
			outputString += columnDelimeter + getString(i , j);
		}
	}

	return '```' + outputString + '```';
}
/*const exampleEmbed = new Discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle('Scrim Player List')
	.setDescription(`${scrimPlayerList}`)
	.setThumbnail('https://static-cdn.jtvnw.net/ttv-boxart/Dota%202-144x192.jpg')
	.setTimestamp();*/