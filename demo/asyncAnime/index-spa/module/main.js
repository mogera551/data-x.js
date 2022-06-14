
const context = {};
const URL_API = "https://animechan.vercel.app/api/quotes/anime";
class AppViewModel {
  "@@title" = "";
  async "@animes#get"() {
    if (this.title == "") return [];
    const params = new URLSearchParams({ title: this.title });
    const response = await fetch(`${URL_API}?${params}`);
    const json = await response.json();
    return (json?.error) ? [] : json;
  }
  "@animes.*.anime";
  "@animes.*.character";
  "@animes.*.quote";
  "#clickSearch"() {
    context.notify("animes");
  }
}

export default { AppViewModel, context }
