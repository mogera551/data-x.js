const tickets = [
  { id:1, name:"Economy", price: 199.95 },
  { id:2, name:"Bussiness", price: 449.22 },
  { id:3, name:"First Class", price: 1199.99 },
];

class AppViewModel {
  "@tickets#get"() {
    return tickets;
  }
  "@tickets.*.id";
  "@tickets.*.name";

  "@@ticketId" = null;
  "@ticket#get"() {
    return tickets.find(ticket => ticket.id === this.ticketId);
  } 
  "@ticket.name";
  "@ticket.price";

  "#eventClickClear"() {
    this.ticketId = null;
  }
}

const dependencyRules = [
  ["ticket", ["ticketId"]],
];

export default { AppViewModel, dependencyRules };