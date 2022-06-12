import Bind from "./Bind.js"
import Loop from "./Loop.js"
import Event from "./Event.js"

const NOT_PROCESSING = ":not([data-x\\:processed])";
const DATA_PROCESSING = "x:processing";
const DATA_PROCESSED = "x:processed";
const DATA_IGNORE = "x:ignore";
const DATA_BIND = "x:bind";
const DATA_LOOP = "x:loop";
const DATA_EVENTS = "x:events";

const SELECTOR_BIND = "[data-x\\:bind]";
const SELECTOR_LOOP = "[data-x\\:loop]";
const SELECTOR_EVENTS = "[data-x\\:events]";
const SELECTOR_PROCESSING = "[data-x\\:processing]";
const SELECTOR_ATTRIBUTE 
  = [SELECTOR_BIND, SELECTOR_LOOP, SELECTOR_EVENTS].map(selector => `${selector}${NOT_PROCESSING}`).join(",");
const SELECTOR_IMPLICIT
  = ["input", "textarea", "select", "button"].map(selector => `${selector}${NOT_PROCESSING}`).join(",");

export default class Collect {
  static inputable(element) {
    return (element.tagName === "INPUT" && element.type !== "button") || element.tagName === "TEXTAREA" || element.tagName === "SELECT" || element?.isContentEditable === true;
  }

  static testFile(element) {
    return (element.tagName === "INPUT" && element.type === "file");
  }

  static testRadio(element) {
    return (element.tagName === "INPUT" && element.type === "radio");
  }

  static testCheckbox(element) {
    return (element.tagName === "INPUT" && element.type === "checkbox");
  }

  static testMulti(element) {
    return (element.tagName === "SELECT" && element.multiple === true);
  }

  static parsePropertyName(name) {
    const names = name.split("|");
    return {
      property: names.shift(),
      filters: names
    }
  }

  static parseDataBind(
    element, 
    value, 
    isInputable = this.inputable(element), 
    isFile = this.testFile(element), 
    isRadio = this.testRadio(element), 
    isCheckbox = this.testCheckbox(element),
    isMulti = this.testMulti(element)
  ) {
    const assignRule = (value, rule) => {
      if (value.includes("=")) {
        const [domProperty, viewModelProperty] = value.split("=");
        const { property, filters } = this.parsePropertyName(viewModelProperty);
        rule.dom.property = domProperty;
        rule.viewModel.property = property;
        rule.filters = filters;
        const setOfDefaultProperties = new Set(isInputable ? (isFile ? ["file"] : isRadio ? ["radio"] : isCheckbox ? ["checked", "checkbox"] : isMulti ? ["multi"] : (element.isContentEditable ? ["textContent"] : ["value"])) : []);
        rule.inputable = setOfDefaultProperties.has(domProperty);
      } else {
        const { property, filters } = this.parsePropertyName(value);
        rule.dom.property = isInputable ? (isFile ? "file" : isRadio ? "radio" : isCheckbox ? "checkbox" : isMulti ? "multi" : (element.isContentEditable ? "textContent" : "value")) : "textContent";
        rule.viewModel.property = property;
        rule.filters = filters;
        rule.inputable = isInputable;
      }
      return rule;
    }
    const values = value.split(",");
    if (values.length == 1) {
      const rule = {dom:{}, viewModel:{}, filters:[]};
      return [assignRule(value, rule)];
    } else {
      const rules = values.map(value => {
        const rule = {dom:{}, viewModel:{}, filters:[]};
        return assignRule(value, rule);
      });
      return rules;
    }
  }

  static collectByAttribute(context, rootElement, binds = [], loops = [], events = []) {
    Array.from(rootElement.querySelectorAll(SELECTOR_ATTRIBUTE)).forEach(element => {
      if (DATA_IGNORE in element.dataset) return;
      const processings = element.dataset[DATA_PROCESSING]?.split(",") ?? [];
      if (DATA_LOOP in element.dataset) {
        // <template data-loop="viewModelProperty">
        // template tag only
        if (element.tagName !== "TEMPLATE") return;
        if (processings.includes("loop")) return;
        const property = element.dataset[DATA_LOOP];
        const rule = {dom:{}, viewModel:{ property }, filters:[]};
        loops.push(new Loop(element, rule, context));
        processings.push("loop");
      } else {
        if (DATA_BIND in element.dataset) {
          if (processings.includes("bind")) return;
          binds.push(...this.parseDataBind(element, element.dataset[DATA_BIND]).map(rule => new Bind(element, rule, context)));
          processings.push("bind");
        } 
        if (DATA_EVENTS in element.dataset) {
          if (processings.includes("events")) return;
          // <div data-events="click,dblclick">
          element.dataset[DATA_EVENTS].split(",").forEach(event => {
            const rule = {dom:{ event }, viewModel:{}, filters:[]};
            events.push(new Event(element, rule, context));
          });
          processings.push("events");
        }
  
      } 
      element.dataset[DATA_PROCESSING] = processings.join(",");
    });
    return { binds, loops, events };
  }

  static collectByImplicit(context, rootElement, binds = [], loops = [], events = []) {
    Array.from(rootElement.querySelectorAll(SELECTOR_IMPLICIT)).forEach(element => {
      if (DATA_IGNORE in element.dataset) return;
      const processings = element.dataset[DATA_PROCESSING]?.split(",") ?? [];
      const isFile = this.testFile(element);
      const isRadio = this.testRadio(element);
      const isCheckbox = this.testCheckbox(element);
      const isMulti = this.testMulti(element);
      const rule = {dom:{}, viewModel:{}, filters:[]};
      if (element.tagName === "BUTTON" || (element.tagName === "INPUT" && element.type === "button")) {
        if (processings.includes("events")) return;
        rule.dom.event = "click";
        events.push(new Event(element, rule, context));
        processings.push("events");
      } else {
        if (processings.includes("bind")) return;
        const { property, filters } = this.parsePropertyName(element.name);
        rule.dom.property = isFile ? "file" : isRadio ? "radio" : isCheckbox ? "checkbox" : isMulti ? "multi" : "value";
        rule.viewModel.property = property;
        rule.filters = filters;
        rule.inputable = true;
        binds.push(new Bind(element, rule, context))
        processings.push("bind");
      }
      element.dataset[DATA_PROCESSING] = processings.join(",");
    });
    return { binds, loops, events };
  }

  static collectByRule(context, rootElement, bindRules, binds = [], loops = [], events = []) {
    const createLoop = (bindRule, element) => loops.push(new Loop(element, bindRule, context));
    const createBind = (bindRule, element) => binds.push(new Bind(element, bindRule, context));
    const createEvent = (bindRule, element) => events.push(new Event(element, bindRule, context));
    const rulesBySelector = new Map();
    bindRules.forEach(rule => {
      !rulesBySelector.has(rule.dom.selector) && rulesBySelector.set(rule.dom.selector, []);
      rulesBySelector.get(rule.dom.selector).push(rule);
    });
    Array.from(rulesBySelector.keys()).forEach(selector => {
      rootElement.querySelectorAll(`${selector}${NOT_PROCESSING}`).forEach(element => {
        if (DATA_IGNORE in element.dataset) return;
        const isInputable = this.inputable(element);
        const processings = element.dataset[DATA_PROCESSING]?.split(",") ?? [];
        const newProcessing = processings.slice();
        rulesBySelector.get(selector).forEach(bindRule => {
          const cloneRule = JSON.parse(JSON.stringify(bindRule));
          if (element.tagName === "TEMPLATE") {
            if (processings.includes("loop")) return;
            createLoop(cloneRule, element);
            newProcessing.push("loop");
          } else if ("event" in cloneRule.dom) {
            if (processings.includes("events")) return;
            createEvent(cloneRule, element);
            newProcessing.push("events");
          } else {
            if (processings.includes("bind")) return;
            cloneRule.inputable = isInputable;
            createBind(cloneRule, element);
            newProcessing.push("bind");
          }
        });
        element.dataset[DATA_PROCESSING] = newProcessing.join(",");
      });
    });
    return { loops, binds, events };
  }
  static collect(context, rootElement, bindRules = []) {
    const binds = [], loops = [], events = [];
    this.collectByRule(context, rootElement, bindRules, binds, loops, events);
    this.collectByAttribute(context, rootElement, binds, loops, events);
    this.collectByImplicit(context, rootElement, binds, loops, events);
    binds.forEach(bind => bind.dom.dataset[DATA_PROCESSED] = "");
    loops.forEach(loop => loop.dom.dataset[DATA_PROCESSED] = "");
    events.forEach(event => event.dom.dataset[DATA_PROCESSED] = "");
    Array.from(rootElement.querySelectorAll(SELECTOR_PROCESSING)).forEach(element => {
      element.removeAttribute(`data-${DATA_PROCESSING}`);
    })
    return { loops, binds, events };
  }
}