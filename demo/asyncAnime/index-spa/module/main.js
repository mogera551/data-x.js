
const context = {};
const URL_API = "https://animechan.vercel.app/api/quotes/anime";
class AppViewModel {
  "@@title" = "";
  "@animes#get" = async () => {
    if (this.title == "") return [];
    const params = new URLSearchParams({ title: this.title });
    const response = await fetch(`${URL_API}?${params}`);
    const json = await response.json();
    return (json?.error) ? [] : json;
  }
  "@animes.*.anime";
  "@animes.*.character";
  "@animes.*.quote";
  "#eventClickSearch" = () => context.notify("animes");
}

export default { AppViewModel, context }
