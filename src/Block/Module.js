import Rules from "../Bind/Rules.js";
import Options from "../Options.js"

export default class Module {
  viewModel;
  AppViewModel;
  html;
  css;
  bindCss;
  dependencyRules;
  template;
  bindRules;
  context;
  _;
  dialog;

  static async load(name, withBindCss, spaPath = Options.spaPath, module = new Module) {
    // scriptをロード
    const scriptModule = await this.loadScript(name, spaPath);
    Object.assign(module, scriptModule?.default ?? {});
    // htmlをロード
    if (module.html === undefined) {
      const html = await this.loadHtml(name, spaPath);
      Object.assign(module, { html });
    } 
    // cssをロード
    if (module.css === undefined) {
      const css = await this.loadCss(name, spaPath);
      Object.assign(module, { css });
    }
    // bindCssをロード
    if (withBindCss && module.bindCss === undefined && module.bindRules === undefined) {
      const bindCss = await this.loadBindCss(name, spaPath);
      Object.assign(module, { bindCss });
    }
    // templateの生成
    const template = this.buildTemplate(name, module.html, module.css);
    Object.assign(module, { template });
    // bindRulesの生成
    if (module.bindRules === undefined && module.bindCss !== undefined) {
      const bindRules = this.buildBindRules(module.bindCss);
      Object.assign(module, { bindRules });
    }
    if (module.dependencyRules === undefined) {
      module.dependencyRules = [];
    }
    if (module.bindRules === undefined) {
      module.bindRules = [];
    }
    return module;
  }

  static async loadScript(name, spaPath = Options.spaPath) {
    const isExternal = (spaPath.startsWith("https://") || spaPath.startsWith("http://"));
    const index = document.baseURI.lastIndexOf("/");
    const base = (index >= 0) ? document.baseURI.slice(0, index + 1) : "";
    const path = (isExternal) ? `${spaPath}/module/${name}.js` : `${base}${spaPath}/module/${name}.js`;
    return import(/* webpackIgnore: true */path).catch(e => {
      console.error(e);
      throw e;
    });
  }

  static async loadHtml(name, spaPath = Options.spaPath) {
    return fetch(`${spaPath}/html/${name}.html`).then(response => {
      if (!response.ok) {
        console.error('response.ok:', response.ok);
        console.error('esponse.status:', response.status);
        console.error('esponse.statusText:', response.statusText);
        throw new Error(response.statusText);
      }
      return response.text();
    }).catch(e => {
      console.error(e);
      throw e;
    });
  }

  static async loadCss(name, spaPath = Options.spaPath) {
    return fetch(`${spaPath}/css/${name}.css`).then(response => {
      if (!response.ok) {
        console.error('response.ok:', response.ok);
        console.error('esponse.status:', response.status);
        console.error('esponse.statusText:', response.statusText);
        throw new Error(response.statusText);
      }
      return response.text();
    }).catch(e => {
      console.error(e);
      throw e;
    });
  }

  static async loadBindCss(name, spaPath = Options.spaPath) {
    return fetch(`${spaPath}/css/${name}.bind.css`).then(response => {
      if (!response.ok) {
        console.error('response.ok:', response.ok);
        console.error('esponse.status:', response.status);
        console.error('esponse.statusText:', response.statusText);
        throw new Error(res.statusText);
      }
      return response.text();
    }).catch(e => {
      console.error(e);
      throw e;
    });
  }
  
  static buildTemplate(name, html, css) {
    const template = document.createElement("template");
    template.innerHTML = html;
    if (css !== undefined) {
      template.innerHTML = "<style>\n" + css + "\n</style>\n" + template.innerHTML;
    }
    template.dataset[`x:block`] = name;
    return template;
  }

  static buildBindRules(bindCss) {
    return Rules.collect(bindCss);
  }

}