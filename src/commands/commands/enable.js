const { oneLine } = require('common-tags');
const Command = require('../base');

module.exports = class EnableCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'enable',
			aliases: ['enable-command', 'cmd-on', 'command-on'],
			group: 'commands',
			memberName: 'enable',
			description: 'Habilita um comando ou grupo de comandos.',
			details: oneLine`
			O argumento deve ser o nome / ID (parcial ou inteiro) de um comando ou grupo de comandos.
			Somente administradores podem usar este comando.
			`,
			examples: ['enable util', 'enable Utility', 'enable prefix'],
			guarded: true,

			args: [
				{
					key: 'cmdOrGrp',
					label: 'command/group',
					prompt: 'Qual comando ou grupo você gostaria de ativar?',
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
		const group = args.cmdOrGrp.group;
		if(args.cmdOrGrp.isEnabledIn(msg.guild, true)) {
			return msg.reply(
				`O \`${args.cmdOrGrp.name}\` ${args.cmdOrGrp.group ? 'comando' : 'grupo'} já está ativado${
					group && !group.isEnabledIn(msg.guild) ?
					`, mas o \`${group.name}\` O grupo está desativado, por isso ainda não pode ser usado` :
					''
				}.`
			);
		}
		args.cmdOrGrp.setEnabledIn(msg.guild, true);
		return msg.reply(
			`Ativado o \`${args.cmdOrGrp.name}\` ${group ? 'coamando' : 'grupo'}${
				group && !group.isEnabledIn(msg.guild) ?
				`, mas o \`${group.name}\` O grupo está desativado, por isso ainda não pode ser usado` :
				''
			}.`
		);
	}
};
