const tickets = [
  { id:1, name:"Economy", price: 199.95 },
  { id:2, name:"Bussiness", price: 449.22 },
  { id:3, name:"First Class", price: 1199.99 },
];
class ViewModelClass {
  "@tickets" = tickets;
  "@tickets.*.id";
  "@tickets.*.name";

  "@@selectTicketId";

  get "chosenTicket"() {
    return this["tickets"].find(ticket => ticket.id == this["selectTicketId"]);
  }
  "@chosenTicket.name";
  "@chosenTicket.price";

  get "dispChosenTicket"() {
    return this["chosenTicket"] != null ? "block" : "none";
  }

  onClickClear() {
    this["selectTicketId"] = "";
  }
}

const dependencyRules = [
  ["chosenTicket", ["selectTicketId"]],
  ["chosenTicket.name", ["chosenTicket"]],
  ["chosenTicket.price", ["chosenTicket"]],
  ["dispChosenTicket", ["chosenTicket"]],
]

export default { ViewModelClass, dependencyRules };