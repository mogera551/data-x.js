import Rules from "../Bind/Rules.js";
import Options from "../Options.js"

export default class Module {
  name;
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
  useModule;

  static async load({
    name, 
    useModule, 
    withBindCss, 
    module = new Module
  }) {
    const spaCssPath = (!useModule) ? Options.spaCssPath : null;
    const spaHtmlPath = (!useModule) ? Options.spaHtmlPath : null; 
    const spaModulePath = (!useModule) ? Options.spaModulePath : null; 
    const modulePath = useModule ? Options.modulePath : null;
    module.name = name;
    module.useModule = useModule;
    // scriptをロード
    const scriptModule = await this.loadScript(name, modulePath ?? spaModulePath);
    Object.assign(module, scriptModule?.default ?? {});
    // htmlをロード
    if (module.html === undefined && spaHtmlPath !== null) {
      const html = await this.loadHtml(name, spaHtmlPath);
      Object.assign(module, { html });
    } 
    // cssをロード
    if (module.css === undefined && spaCssPath !== null) {
      const css = await this.loadCss(name, spaCssPath);
      Object.assign(module, { css });
    }
    // bindCssをロード
    if (withBindCss && module.bindCss === undefined && spaCssPath !== null && module.bindRules === undefined) {
      const bindCss = await this.loadBindCss(name, spaCssPath);
      Object.assign(module, { bindCss });
    }
    return this.build(name, module);
  }

  static build(name, module) {
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

  static async loadScript(name, path) {
    const isExternal = (path.startsWith("https://") || path.startsWith("http://") || path[0] === "/");
    const index = document.baseURI.lastIndexOf("/");
    const base = (index >= 0) ? document.baseURI.slice(0, index + 1) : "";
    const importPath = (isExternal) ? `${path}/${name}.js` : `${base}${path}/${name}.js`;
    return import(/* webpackIgnore: true */importPath).catch(e => {
      console.error(e);
      throw e;
    });
  }

  static async loadHtml(name, path) {
    return fetch(`${path}/${name}.html`).then(response => {
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

  static async loadCss(name, path) {
    return fetch(`${path}/${name}.css`).then(response => {
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

  static async loadBindCss(name, path) {
    return fetch(`${path}/${name}.bind.css`).then(response => {
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