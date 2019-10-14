const { Command } = require("faux-classes");

module.exports = class ViewList extends Command {

  get name() { return "viewlist"; }
  get cooldown() { return 2; }
  get permissions() { return ["auth", "board"]; }
  get aliases() { return ["list"]; }
  get argRequirement() { return 1; }

  async exec(message, args, { user }) {
    let listName = args.join(" ").replace(/\s*$/, "");
    let matches = listName.match(/\s\d+$/);
    let p = 1;
    let ipp = 15;
    if (matches) {
      // pageNumber() will sort out numbers later
      p = parseInt(matches[0]);
      listName = listName.replace(/\d+$/, "").replace(/\s*$/, "");
    }
    let body = await this.client.trello.get.lists(user.trelloToken, user.current);
    if (!body.length)
      return message.reply("There are no found lists on the board. Check the archive with `T!listarchive`.");
    let query = await this.client.util.query(
      message, body,
      listName,
      "name", item => `${item.name} (${item.cards.length} Cards)`,
      "Type the number of the list you want to view."
    );
    if (query.quit) return;
    let result = query.result;
    if (result !== null) {
      if (!result.cards.length) {
        message.reply("There were no found cards on that lists. You could check the archive with `T!cardarchive` or create one with `T!createcard`.");
      } else {
        await this.client.promptList(message, result.cards, (card, embed) => {
          let emojis = (card.subscribed ? "🔔" : "");
          if (embed)
            return `\`${card.shortLink}\` ${card.name} ${emojis} ${card.labels.map(label => `**\`${label.name || "Unnamed Label"}}  (${label.color || "No Color"})\`**`).join(" ")}`;
          else {
            let l = "";
            if (card.labels.length)
              l += "{" + this.client.util.layout.cardLabels(card.labels).join(", ") + "}";
            return `${card.shortLink}: ${card.name} ${emojis} ${l}`;
          }
        }, {
          header: "Use `" + this.client.config.prefix + "card <cardID>` to see card information\n" +
            "Use `" + this.client.config.prefix + "viewlist " + result.name + " [page]` to iterate this list",
          pluralName: "Trello Lists",
          itemsPerPage: 10,
          startPage: args[0]
        });
      }
    } else message.reply("Uh-Oh! Either that list is non-existent or it's not on the selected board!");
  }

  get helpMeta() {
    return {
      category: "Viewing",
      description: "Lists all cards in that list.",
      usage: ["<listName> [page]"]
    };
  }
};
