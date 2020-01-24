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

const { Command } = require("faux-classes");

module.exports = class Switch extends Command {

  get name() { return "switch"; }
  get cooldown() { return 2; }
  get permissions() { return ["auth"]; }
  get argRequirement() { return 1; }

  async exec(message, args, { user }) {
    let boards = await this.client.trello.get.boards(user.trelloToken, user.trelloID);
    if (!boards.boards.map(b => b.shortLink).includes(args[0])) {
      message.channel.send("Você não tem acesso a esse quadro!");
    } else {
      await this.client.data.set.user(message.author.id, { current: args[0] });
      let board = boards.boards.filter(b => b.shortLink === args[0]);
      message.channel.send(`Quadro "${board[0].name}" \`(${args[0]})\` foi selecionado com sucesso.`);
    }
  }

  get helpMeta() {
    return {
      category: "Visualização",
      description: "Seleciona um quadro. Veja todos os quadros em que faz parte usando " + this.client.config.prefix + "`boards`.",
      usage: ["<boardID>"]
    };
  }
};
