const { Command } = require("faux-classes");

module.exports = class CloseCard extends Command {

  get name() { return "closecard"; }
  get cooldown() { return 2; }
  get permissions() { return ["auth", "board", "trello-perm"]; }
  get aliases() { return ["archivecard"]; }
  get argRequirement() { return 1; }

  async exec(message, args, { user }) {
    let body = await this.client.trello.get.cards(user.trelloToken, user.current);
    let bid = undefined;
    Object.keys(body).map((board) => {
      board = body[board];
      if (board.shortLink == args[0]) {
        bid = board;
        bid.id = args[0];
      }
    });
    if (bid !== undefined) {
      await this.client.trello.set.card.closed(user.trelloToken, bid.id, true);
      message.reply(`Cartão arquivado: "${bid.name}". \`(${bid.shortLink})\``);
    } else {
      message.reply("Oops! O ID do cartão não existe ou não está no quadro selecionado!");
    }
  }

  get helpMeta() {
    return {
      category: "Editing",
      description: "Arquiva um cartão.",
      usage: ["<cardID>"]
    };
  }
};
