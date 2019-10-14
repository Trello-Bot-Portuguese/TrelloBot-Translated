const { Command } = require("faux-classes");

module.exports = class AddList extends Command {

  get name() { return "addlist"; }
  get cooldown() { return 2; }
  get permissions() { return ["auth", "board", "trello-perm"]; }
  get aliases() { return ["createlist", "+list", "clist", "alist"]; }
  get argRequirement() { return 1; }

  async exec(message, args, { user }) {
    await this.client.trello.add.list(user.trelloToken, user.current, args.join(" "));
    message.reply(`Lista Adicionada "${args.join(" ")}".`);
  }

  get helpMeta() {
    return {
      category: "Editing",
      description: "Adiciona uma lista em um quadro.",
      usage: ["<listName>"]
    };
  }
};
