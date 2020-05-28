const { stripIndents, oneLine } = require('common-tags');
const Command = require('../base');

module.exports = class PrefixCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'prefix',
			group: 'util',
			memberName: 'prefix',
			description: 'Mostra ou define o prefix do comando.',
			format: '[prefix/"default"/"none"]',
			details: oneLine`
				Se nenhum prefixo for fornecido, o prefixo atual será mostrado.
				Se o prefixo for "padrão", o prefixo será redefinido para o prefixo padrão do bot.
				Se o prefixo for "none", o prefixo será completamente removido, permitindo apenas que as menções executem comandos.
				Somente administradores podem alterar o prefixo.
			`,
			examples: ['prefix', 'prefix -', 'prefix omg!', 'prefix default', 'prefix none'],

			args: [
				{
					key: 'prefix',
					prompt: 'Como você gostaria de definir o prefixo do bot como?',
					type: 'string',
					max: 15,
					default: ''
				}
			]
		});
	}

	async run(msg, args) {
		// Just output the prefix
		if(!args.prefix) {
			const prefix = msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix;
			return msg.reply(stripIndents`
				${prefix ? `O prefixo do comando é \`\`${prefix}\`\`.` : 'Não há prefixo de comando.'}
				Para executar comandos, use ${msg.anyUsage('comando')}.
			`);
		}

		// Check the user's permission before changing anything
		if(msg.guild) {
			if(!msg.member.hasPermission('ADMINISTRATOR') && !this.client.isOwner(msg.author)) {
				return msg.reply('Somente administradores podem alterar o prefixo do comando.');
			}
		} else if(!this.client.isOwner(msg.author)) {
			return msg.reply('Somente o (s) proprietário (s) do bot pode alterar o prefixo do comando global.');
		}

		// Save the prefix
		const lowercase = args.prefix.toLowerCase();
		const prefix = lowercase === 'none' ? '' : args.prefix;
		let response;
		if(lowercase === 'default') {
			if(msg.guild) msg.guild.commandPrefix = null; else this.client.commandPrefix = null;
			const current = this.client.commandPrefix ? `\`\`${this.client.commandPrefix}\`\`` : 'sem prefixo';
			response = `Redefina o prefixo do comando para o padrão (atualmente ${current}).`;
		} else {
			if(msg.guild) msg.guild.commandPrefix = prefix; else this.client.commandPrefix = prefix;
			response = prefix ? `Defina o prefixo do comando como \`\`${args.prefix}\`\`.` : 'Removido completamente o prefixo do comando.';
		}

		await msg.reply(`${response} Para executar comandos, use ${msg.anyUsage('comando')}.`);
		return null;
	}
};
