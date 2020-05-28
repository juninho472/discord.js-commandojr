const Command = require('../base');

module.exports = class UnknownCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'unknown-command',
			group: 'util',
			memberName: 'unknown-command',
			description: 'Exibe informações de ajuda para quando um comando desconhecido é usado.',
			examples: ['unknown-command kickeverybodyever'],
			unknown: true,
			hidden: true
		});
	}

	run(msg) {
		return msg.reply(
			`Comando desconhecido. Use ${msg.anyUsage(
				'help',
				msg.guild ? undefined : null,
				msg.guild ? undefined : null
			)} para visualizar a lista de comandos.`
		);
	}
};
