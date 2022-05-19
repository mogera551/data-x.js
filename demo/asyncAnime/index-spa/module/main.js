
const context = {};
const URL_API = "https://animechan.vercel.app/api/quotes/anime";
class AppViewModel {
  "@@title" = "";
  "@animes#get" = async () => {
    if (this.title == "") return [];
    const params = new URLSearchParams({ title: this.title });
    const result = await fetch(`${URL_API}?${params}`)
      .then(response => {
        return response.json();
      });
    console.log("animes#get complete");
    return result;
  }
  "@animes.*.anime";
  "@animes.*.character";
  "@animes.*.quote";
  "#eventClickSearch" = () => context.notify("animes");
}

export default { AppViewModel, context }
