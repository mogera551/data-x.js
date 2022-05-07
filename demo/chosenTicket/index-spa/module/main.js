const tickets = [
  { id:1, name:"Economy", price: 199.95 },
  { id:2, name:"Bussiness", price: 449.22 },
  { id:3, name:"First Class", price: 1199.99 },
];

class AppViewModel {
  "@tickets" = tickets;
  "@tickets.*.id";
  "@tickets.*.name";

  "@@chosenTicketId" = null;
  "@chosenTicket#get" = () => this["tickets"].find(ticket => ticket.id === this["chosenTicketId"]);
  "@chosenTicket.name";
  "@chosenTicket.price";

  "#eventClickClear" = event => this["chosenTicketId"] = null;
}

const dependencyRules = [
  ["chosenTicket", ["chosenTicketId"]],
  ["chosenTicket.name", ["chosenTicket"]],
  ["chosenTicket.price", ["chosenTicket"]],
]

export default { AppViewModel, dependencyRules };