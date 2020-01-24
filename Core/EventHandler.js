/*
 This file is part of TrelloBot.

 Copyright © Snazzah 2016 - 2019
 Copyright © Yamboy1 (and contributors) 2019 - 2020
 Copyright © Lobo Metalurgico 2019 - 2020

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/



const Util = require("./Util");
const config = require("../Config/")


module.exports = class EventHandler {
  
  constructor(client) {
    this.client = client;
    client.on("message", this.onMessage.bind(this));
    client.on("messageDelete", this.onMessageDelete.bind(this));
    client.on("messageReactionAdd", this.onReaction.bind(this));
    client.on("guildMemberAdd", this.onMemberJoin.bind(this));
  }

  

  async onMessage(Message) {

    this.client.stats.bumpStat("messages");
    if (Message.author.bot) return;
    if (Message.channel.type !== "dm" && !Message.channel.permissionsFor(this.client.user).has("SEND_MESSAGES")) return;
    if (Message.channel.type === "dm") return Message.reply("Não trabalho com mensagens privadas. Apenas os outros bots do lobo.");
    if (Message.content == `<@${this.client.user.id}>` || Message.content == `<@!${this.client.user.id}>` ) return Message.reply(`Caso não saiba, meu prefixo é \`${config.prefix}\`.`)

    if (this.client.awaitedMessages.hasOwnProperty(Message.channel.id)
      && this.client.awaitedMessages[Message.channel.id].hasOwnProperty(Message.author.id)) {
      if (this.client.awaitedMessages[Message.channel.id][Message.author.id].callback(Message)) {
        this.client.awaitedMessages[Message.channel.id][Message.author.id].resolve(Message);
        return;
      }
    }

    if (!Message.content.match(Util.prefixRegex(this.client))) return;
    try {
      let { prefix } = this.client.config;
      let args = Util.stripPrefix(Message).split(" ");
      let cname = args.splice(0, 1)[0];
      let command = this.client.cmds.get(cname);
      if (!command) return;
      let { usage = [""] } = command.helpMeta;
      if (await this.client.cmds.processCooldown(Message, cname)) {
        let user = await this.client.data.get.user(Message.author.id);
        if (args.length < command.argRequirement) return Message.reply(`Você precisa completar o comando!\nUse: \`${usage.reduce((acc, x, i) => `${acc}${i > 0 ? "` ou `" : ""}${prefix}${cname} ${x}`, "")}\``);
        if (command.permissions.includes("attach") && !this.client.attach(Message)) return Message.reply("Eu preciso da permissão de `Anexar Arquivos` para usar esse comando!");
        if (command.permissions.includes("embed") && !this.client.embed(Message)) return Message.reply("Eu preciso da permissão `Embed Links` para usar esse comando!");
        if (command.permissions.includes("elevated") && !this.client.elevated(Message)) return Message.reply("Apenas usuários especificados em minhas configurações podem usar este comando!");
        if (command.permissions.includes("trello-perm") && !this.client.util.checkPerm(Message.author, Message.channel.guild)) return Message.reply("Para esse comando você precisa ser o dono do server ou usar o cargo com nome de `Trello`!");
        if (command.permissions.includes("auth") && user === null) return Message.reply(`Você não sincronizou sua conta do discord com o trello! Por favor, sincronize aqui: ${this.client.config.authURL}`);
        if (command.permissions.includes("board") && (user === null || user.current === null)) return Message.reply(`Nenhum quadro selecionado. Use \`${this.client.config.prefix}switch\` para selecionar.`);
        this.client.stats.bumpStat("commands");
        this.client.stats.bumpCommandStat(command.name);
        try {
          await command.exec(Message, args, { user });
        } catch (e) {
          this.client.util.sendError(Message, e);
        }
      } else {
        let cd = await this.client.db.hget(`cooldowns:${Message.author.id}`, command.name);
        Message.reply(`Oops, tem cooldown aqui! *(${Math.ceil(command.cooldownAbs - (Date.now() - cd))})*`);
      }
    } catch (e) {
      this.client.error("MESSAGE HANDLING ERROR", e, e.stack);
    }
  }

  onMessageDelete(Message) {
    if (this.client.pageProcesses.hasOwnProperty(Message.channel.id)) {
      this.client.util.keyValueForEach(this.client.pageProcesses[Message.channel.id], (k, v) => {
        if (v.id === Message.id) v.stop();
      });
    }
  }

  onReaction(react, user) {
    if (this.client.user.id !== user.id) {
      if (this.client.pageProcesses.hasOwnProperty(react.message.channel.id) && this.client.pageProcesses[react.message.channel.id].hasOwnProperty(user.id) && this.client.pageProcesses[react.message.channel.id][user.id].id === react.message.id) {
        this.client.pageProcesses[react.message.channel.id][user.id].resolve(react);
      }
    }
  }

  async onMemberJoin() {
    this.client.stats.bumpStat("users");
  }
};
