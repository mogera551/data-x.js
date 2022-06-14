const member = {
  name: "Yamada Taro",
  age: 36,
  address: {
    postalcode: "100-0001",
    prefecture: "Tokyo",
    city: "Chiyoda-ku",
  }
}

class AppViewModel {
  "@member" = member;
  "@member.name";
  "@member.age";
  "@member.address.postalcode";
  "@member.address.prefecture";
  "@member.address.city";
}

export default { AppViewModel }
