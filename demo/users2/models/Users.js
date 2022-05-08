export default class Users {
  constructor() {
    this.users = [
      { id: 1, name: "Tanaka", email: "tanaka@example.com" },
      { id: 2, name: "Suzuki", email: "suzuki@example.com" },
      { id: 3, name: "Yamada", email: "yamada@example.com" }
    ];
  }

  getUsers() {
    return this.users;
  }

  getUser(id) {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].id === id) {
        return this.users[i];
      }
    }
    return undefined;
  }

  setUser(user) {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].id === user.id) {
        this.users[i].name = user.name;
        this.users[i].email = user.email;
      }
    }
  }
}
