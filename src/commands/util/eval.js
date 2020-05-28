const util = require('util');
const discord = require('discord.js');
const tags = require('common-tags');
const { escapeRegex } = require('../../util');
const Command = require('../base');

const nl = '!!NL!!';
const nlPattern = new RegExp(nl, 'g');

module.exports = class EvalCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'eval',
			group: 'util',
			memberName: 'eval',
			description: 'Executa código JavaScript.',
			details: 'Somente o proprietário do bot pode usar este comando.',
			ownerOnly: true,

			args: [
				{
					key: 'script',
					prompt: 'Qual código você gostaria de avaliar?',
					type: 'string'
				}
			]
		});

		this.lastResult = null;
		Object.defineProperty(this, '_sensitivePattern', { value: null, configurable: true });
	}

	run(msg, args) {
		// Faça um monte de ajudantes
		/* eslint-disable no-unused-vars */
		const message = msg;
		const client = msg.client;
		const lastResult = this.lastResult;
		const doReply = val => {
			if(val instanceof Error) {
				msg.reply(`Erro de retorno de chamadar: \`${val}\``);
			} else {
				const result = this.makeResultMessages(val, process.hrtime(this.hrStart));
				if(Array.isArray(result)) {
					for(const item of result) msg.reply(item);
				} else {
					msg.reply(result);
				}
			}
		};
		/* eslint-enable no-unused-vars */

		// Execute o código e meça o tempo de execução
		let hrDiff;
		try {
			const hrStart = process.hrtime();
			this.lastResult = eval(args.script);
			hrDiff = process.hrtime(hrStart);
		} catch(err) {
			return msg.reply(`Erro ao avaliar: \`${err}\``);
		}

		// Prepare-se para o tempo de retorno de chamada e responda
		this.hrStart = process.hrtime();
		const result = this.makeResultMessages(this.lastResult, hrDiff, args.script);
		if(Array.isArray(result)) {
			return result.map(item => msg.reply(item));
		} else {
			return msg.reply(result);
		}
	}

	makeResultMessages(result, hrDiff, input = null) {
		const inspected = util.inspect(result, { depth: 0 })
			.replace(nlPattern, '\n')
			.replace(this.sensitivePattern, '--snip--');
		const split = inspected.split('\n');
		const last = inspected.length - 1;
		const prependPart = inspected[0] !== '{' && inspected[0] !== '[' && inspected[0] !== "'" ? split[0] : inspected[0];
		const appendPart = inspected[last] !== '}' && inspected[last] !== ']' && inspected[last] !== "'" ?
			split[split.length - 1] :
			inspected[last];
		const prepend = `\`\`\`javascript\n${prependPart}\n`;
		const append = `\n${appendPart}\n\`\`\``;
		if(input) {
			return discord.splitMessage(tags.stripIndents`
				*Executado em ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*
				\`\`\`javascript
				${inspected}
				\`\`\`
			`, { maxLength: 1900, prepend, append });
		} else {
			return discord.splitMessage(tags.stripIndents`
				*Retorno de chamada executado após ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*
				\`\`\`javascript
				${inspected}
				\`\`\`
			`, { maxLength: 1900, prepend, append });
		}
	}

	get sensitivePattern() {
		if(!this._sensitivePattern) {
			const client = this.client;
			let pattern = '';
			if(client.token) pattern += escapeRegex(client.token);
			Object.defineProperty(this, '_sensitivePattern', { value: new RegExp(pattern, 'gi'), configurable: false });
		}
		return this._sensitivePattern;
	}
};
