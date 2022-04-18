import Bind from "./Bind.js"
import Loop from "./Loop.js"
import Event from "./Event.js"

const NOT_PROCESSING = ":not([data-processing]):not([data-processed])";
const DATA_PROCESSING = "processing";
const DATA_PROCESSED = "processed";
const DATA_IGNORE = "ignore";
const DATA_BIND = "bind";
const DATA_LOOP = "loop";
const DATA_EVENTS = "events";

const SELECTOR_BIND = "[data-bind]";
const SELECTOR_LOOP = "[data-loop]";
const SELECTOR_EVENTS = "[data-events]";
const SELECTOR_ATTRIBUTE 
  = [SELECTOR_BIND, SELECTOR_LOOP, SELECTOR_EVENTS].map(selector => `${selector}${NOT_PROCESSING}`).join(",");
const SELECTOR_IMPLICIT
  = ["input", "textarea", "select", "button"].map(selector => `${selector}${NOT_PROCESSING}`).join(",");

export default class Collect {
  static inputable(element) {
    return (element.tagName === "INPUT" && element.type !== "button") || element.tagName === "TEXTAREA" || element.tagName === "SELECT";
  }

  static testRadio(element) {
    return (element.tagName === "INPUT" && element.type === "radio");
  }

  static testCheckbox(element) {
    return (element.tagName === "INPUT" && element.type === "checkbox");
  }

  static parseDataBind(
    element, 
    value, 
    isInputable = this.inputable(element), 
    isRadio = this.testRadio(element), 
    isCheckbox = this.testCheckbox(element)
  ) {
    const values = value.split(",");
    if (values.length == 1) {
      const rule = {dom:{}, viewModel:{}};
      if (value.includes("=")) {
        const [domProperty, viewModelProperty] = value.split("=");
        rule.dom.property = domProperty;
        rule.viewModel.property = viewModelProperty;
      } else {
        rule.dom.property = isInputable ? (isRadio ? "radio" : isCheckbox ? "checkbox" : "value") : "textContent";
        rule.viewModel.property = value;
      }
      return [rule];
    } else {
      const rules = values.map(s => {
        const [domProperty, vmProperty] = s.split("=");
        return { dom:{ property:domProperty }, viewModel:{ property: vmProperty } };
      });
      return rules;
    }
  }

  static collectByAttribute(context, rootElement, binds = [], loops = [], events = []) {
    Array.from(rootElement.querySelectorAll(SELECTOR_ATTRIBUTE)).forEach(element => {
      if (DATA_IGNORE in element.dataset) return;
      if (DATA_BIND in element.dataset) {
        binds.push(...this.parseDataBind(element, element.dataset[DATA_BIND]).map(rule => new Bind(element, rule, context)));
      } else if (DATA_LOOP in element.dataset) {
        // <template data-loop="viewModelProperty">
        // template tag only
        if (element.tagName !== "TEMPLATE") return;
        const property = element.dataset[DATA_LOOP];
        const rule = {dom:{}, viewModel:{ property }};
        loops.push(new Loop(element, rule, context));
      } else if (DATA_EVENTS in element.dataset) {
        // <div data-events="click,dblclick">
        element.dataset[DATA_EVENTS].split(",").forEach(event => {
          const rule = {dom:{ event }, viewModel:{}};
          events.push(new Event(element, rule, context));
        });
      }
      element.dataset[DATA_PROCESSING] = "";
    });
    return { binds, loops, events };
  }

  static collectByImplicit(context, rootElement, binds = [], loops = [], events = []) {
    Array.from(rootElement.querySelectorAll(SELECTOR_IMPLICIT)).forEach(element => {
      if (DATA_IGNORE in element.dataset) return;
      const isRadio = this.testRadio(element);
      const isCheckbox = this.testCheckbox(element);
      const rule = {dom:{}, viewModel:{}};
      if (element.tagName === "BUTTON" || (element.tagName === "INPUT" && element.type === "button")) {
        rule.dom.event = "click";
        events.push(new Event(element, rule, context));
      } else {
        rule.dom.property = isRadio ? "radio" : isCheckbox ? "checkbox" : "value";
        rule.viewModel.property = element.name;
        rule.inputable = true;
        binds.push(new Bind(element, rule, context))
      }
      element.dataset[DATA_PROCESSING] = "";
    });
    return { binds, loops, events };
  }

  static collectByRule(context, rootElement, bindRules, binds = [], loops = [], events = []) {
    const createLoop = (bindRule, element) => loops.push(new Loop(element, bindRule, context));
    const createBind = (bindRule, element) => binds.push(new Bind(element, bindRule, context));
    const createEvent = (bindRule, element) => events.push(new Event(element, bindRule, context));
    bindRules.forEach(bindRule => {
      const elements = rootElement.querySelectorAll(`${bindRule.dom.selector}${NOT_PROCESSING}`);
      elements.forEach(element => {
        if (DATA_IGNORE in element.dataset) return;
        (element.tagName === "TEMPLATE") ? createLoop(bindRule, element)
          : ("event" in bindRule.dom) ? createEvent(bindRule, element)
          : createBind(bindRule, element);
      });
    });
    return { loops, binds, events };
  }

  static collect(context, rootElement, bindRules = []) {
    const binds = [], loops = [], events = [];
    this.collectByAttribute(context, rootElement, binds, loops, events);
    this.collectByImplicit(context, rootElement, binds, loops, events);
    this.collectByRule(context, rootElement, bindRules, binds, loops, events);
    binds.forEach(bind => bind.dom.dataset[DATA_PROCESSED] = "");
    loops.forEach(loop => loop.dom.dataset[DATA_PROCESSED] = "");
    events.forEach(event => event.dom.dataset[DATA_PROCESSED] = "");
    return { loops, binds, events };
  }
}