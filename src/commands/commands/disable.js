const { oneLine } = require('common-tags');
const Command = require('../base');

module.exports = class DisableCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'disable',
			aliases: ['disable-command', 'cmd-off', 'command-off'],
			group: 'commands',
			memberName: 'disable',
			description: 'Desativa comandos ou grupos de comandos.',
			details: oneLine`
			O argumento deve ser o nome / ID (parcial ou inteiro) de um comando ou grupo de comandos.
			Somente administradores podem usar este comando.
			`,
			examples: ['disable util', 'disable Utility', 'disable prefix'],
			guarded: true,

			args: [
				{
					key: 'cmdOrGrp',
					label: 'command/group',
					prompt: 'Qual comando ou grupo você gostaria de desativar?',
					type: 'group|command'
				}
			]
		});
	}

	hasPermission(msg) {
		if(!msg.guild) return this.client.isOwner(msg.author);
		return msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author);
	}

	run(msg, args) {
		if(!args.cmdOrGrp.isEnabledIn(msg.guild, true)) {
			return msg.reply(
				`O \`${args.cmdOrGrp.name}\` ${args.cmdOrGrp.group ? 'comando' : 'grupo'} já está desativado.`
			);
		}
		if(args.cmdOrGrp.guarded) {
			return msg.reply(
				`Você não pode desativar o \`${args.cmdOrGrp.name}\` ${args.cmdOrGrp.group ? 'coamando' : 'grupo'}.`
			);
		}
		args.cmdOrGrp.setEnabledIn(msg.guild, false);
		return msg.reply(`Desativou o \`${args.cmdOrGrp.name}\` ${args.cmdOrGrp.group ? 'comando' : 'grupo'}.`);
	}
};
