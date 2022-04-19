export default class BlockLoader {
  #options;

  constructor(options) {
    this.#options = options;
  }

  async load(name) {
    const [html, css, module] = await Promise.all([
      this.#loadParts(name)
      .then(res => {
        if (!res.ok) {
          console.error('response.ok:', response.ok);
          console.error('esponse.status:', response.status);
          console.error('esponse.statusText:', response.statusText);
          throw new Error(res.statusText);
        }
        return res.text();
      })
      .catch(e => {
        console.log(e);
        throw `parts (${name}) load fail`;
      }),
      new Promise((resolve, reject) => {
        this.#loadCss(name)
        .then(res => {
          if (!res.ok) {
            console.error('response.ok:', response.ok);
            console.error('esponse.status:', response.status);
            console.error('esponse.statusText:', response.statusText);
            throw new Error(res.statusText);
          }
          return res.text();
        })
        .then(txt => {
          resolve(txt);
        }).catch(e => {
          resolve(null);
        });
      }),
      this.#loadScript(name).catch(e => {
        console.error(e);
        throw e;
      }),
    ]);
    const template = this.#createTemplate({name, html, css});
    document.body.appendChild(template);
    return { template, module};
  }

  #loadScript(name, spaPath = this.#options?.spaPath) {
    const index = document.baseURI.lastIndexOf("/");
    if (index >= 0) {
      const base = document.baseURI.slice(0, index + 1);
      return import(`${base}${spaPath}/module/${name}.js`);
    }
    return import(`${spaPath}/module/${name}.js`);
  }

  #loadParts(name, spaPath = this.#options?.spaPath) {
    return fetch(`${spaPath}/html/${name}.html`);
  }

  #loadCss(name, spaPath = this.#options?.spaPath) {
    return fetch(`${spaPath}/css/${name}.css`);
  }

  #createTemplate({name, html, css}) {
    const template = document.createElement("template");
    template.innerHTML = html;
    if (css != null) {
      template.innerHTML = "<style>\n" + css + "\n</style>\n" + template.innerHTML;
    }
    template.dataset[`block`] = name;
    return template;
  }
}