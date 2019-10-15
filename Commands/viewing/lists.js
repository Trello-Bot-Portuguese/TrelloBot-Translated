/*
 This file is part of TrelloBot.

 Copyright © Snazzah ??? - 2019
 Copyright © Yamboy1 (and contributors) 2019
 Copyright © Lobo Metalurgico 2019

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

const { Command } = require("faux-classes");

module.exports = class Lists extends Command {

  get name() { return "lists"; }
  get cooldown() { return 2; }
  get permissions() { return ["auth", "board"]; }

  async exec(message, args, { user }) {
    let body = await this.client.trello.get.lists(user.trelloToken, user.current);
    if (!body.length)
      return message.reply("Não foram encontradaslistas no quadro. Verifique as arquivadas usando `" + this.client.config.prefix +"listarchive`.");
    await this.client.promptList(message, body, (list, embed) => {
      let emojis = (list.subscribed ? "🔔" : "");
      if (embed)
        return `${list.name} ${emojis} *(${list.cards.length} Cartões)*`;
      else return `${list.name} ${emojis} (${list.cards.length} Cartões)`;
    }, {
      header: "Use `" + this.client.config.prefix + "viewlist <listName>` para ver todos os cartões numa lista\n" +
        "Use `" + this.client.config.prefix + "lists [página]` para ver as listas",
      pluralName: "Listas do Trello",
      itemsPerPage: 15,
      startPage: args[0]
    });
  }

  get helpMeta() {
    return {
      category: "Visualização",
      description: "Lista todos as listas no quadro selecionado.",
      usage: ["[página]"]
    };
  }
};
