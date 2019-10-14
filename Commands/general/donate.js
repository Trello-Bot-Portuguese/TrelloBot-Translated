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

module.exports = class Donate extends Command {

  get name() { return "donate"; }
  get cooldown() { return 0; }
  get aliases() { return ["patreon", "paypal"]; }

  exec(message) {
    if(!(Array.isArray(this.client.config.donate) && this.client.config.donate[0]))
      return message.channel.send("The bot owner hasn't supplied a donate link!");
    message.channel.send(`Support development by donating!\n${this.client.util.linkList(this.client.config.donate)}`);
  }

  get helpMeta() {
    return {
      category: "General",
      description: "Get the donation links for the developer."
    };
  }
};
