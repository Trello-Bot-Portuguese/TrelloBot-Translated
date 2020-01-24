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

module.exports = class RestartAll extends Command {

  get name() { return "restartall"; }
  get permissions() { return ["elevated"]; }
  get listed() { return false; }

  async exec(message, args) {
    if (!this.client.isSharded()) return message.reply("O bot não está em um shard.");
    await message.channel.send(`Reiniciando todos os shards.`);
    this.client.shard.broadcastEval("process.exit(0)");
  }

  get helpMeta() {
    return {
      category: "Admin",
      description: "Reinicia todos os shards."
    };
  }
};