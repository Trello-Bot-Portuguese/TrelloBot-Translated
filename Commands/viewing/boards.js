const { Command } = require("faux-classes");

module.exports = class Boards extends Command {

  get name() { return "boards"; }
  get cooldown() { return 2; }
  get permissions() { return ["auth"]; }

  async exec(message, args, { user }) {
    let body = await this.client.trello.get.boards(user.trelloToken, user.trelloID);
    if (!body.boards.length)
      return message.reply("Não foram encontrados quadros em que você gerencia. Você pode criar um quadro em https://trello.com/.");
    await this.client.promptList(message, body.boards, (board, embed) => {
      let emojis = (board.subscribed ? "🔔" : "") + (board.starred ? "⭐" : "") + (board.pinned ? "📌" : "");
      let current = board.shortLink === user.current;
      if (embed) {
        if (current)
          return `\`${board.shortLink}\` ${emojis} [${board.name} **(Current)**](${board.shortUrl})`;
        else return `\`${board.shortLink}\` ${emojis} ${board.name}`;
      } else {
        if (current)
          return `> ${board.shortLink}: ${board.name} (Current) ${emojis}`;
        else return `${board.shortLink}: ${board.name} ${emojis}`;
      }
    }, {
      header: "Use `" + this.client.config.prefix + "switch <boardID>` para alternar entre os quadros.\n" +
        "Use `" + this.client.config.prefix + "boards [página]` parra ver a lista de quadros.",
      pluralName: "Quadros do Trello",
      itemsPerPage: 15,
      startPage: args[0]
    });
  }

  get helpMeta() {
    return {
      category: "Viewing",
      description: "Mostra todos os seus quadros.",
      usage: ["[página]"]
    };
  }
};
