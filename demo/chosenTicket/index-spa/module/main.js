const tickets = [
  { id:1, name:"Economy", price: 199.95 },
  { id:2, name:"Bussiness", price: 449.22 },
  { id:3, name:"First Class", price: 1199.99 },
];

class ViewModelClass {
  "@tickets" = tickets;
  "@tickets.*.id";
  "@tickets.*.name";

  "@@chosenTicketId" = "";
  "@chosenTicket#get" = () => this["tickets"].find(ticket => ticket.id == this["chosenTicketId"]);
  "@chosenTicket.name";
  "@chosenTicket.price";

  "@@eventClickClear#set" = event => this["chosenTicketId"] = "";
}

const dependencyRules = [
  ["chosenTicket", ["chosenTicketId"]],
  ["chosenTicket.name", ["chosenTicket"]],
  ["chosenTicket.price", ["chosenTicket"]],
]

export default { ViewModelClass, dependencyRules };