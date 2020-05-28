const { oneLine } = require('common-tags');
const Command = require('../base');

module.exports = class UnloadCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'unload',
			aliases: ['unload-command'],
			group: 'commands',
			memberName: 'unload',
			description: 'Unloads a command.',
			details: oneLine`
			O argumento deve ser o nome / ID (parcial ou inteiro) de um comando.
			Somente o proprietário do bot pode usar este comando.
			`,
			examples: ['unload some-command'],
			ownerOnly: true,
			guarded: true,

			args: [
				{
					key: 'command',
					prompt: 'Qual comando você gostaria de descarregar?',
					type: 'command'
				}
			]
		});
	}

	async run(msg, args) {
		args.command.unload();

		if(this.client.shard) {
			try {
				await this.client.shard.broadcastEval(`
					if(this.shard.id !== ${this.client.shard.id}) this.registry.commands.get('${args.command.name}').unload();
				`);
			} catch(err) {
				this.client.emit('warn', `Erro ao transmitir comando descarregar para outros shards`);
				this.client.emit('error', err);
				await msg.reply(`Descarregando \`${args.command.name}\` comando, mas não conseguiu descarregar em outros shards.`);
				return null;
			}
		}

		await msg.reply(`Descarregando \`${args.command.name}\` comando${this.client.shard ? ' em todos os fragmentos' : ''}.`);
		return null;
	}
};
