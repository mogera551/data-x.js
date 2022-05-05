
/**
 * --bind-textContent: property;
 * --bind-value: property;
 * --bind-style-display: property;
 * --bind-class-selected: property;
 * --bind-radio: property;
 * --bind-checkbox: property;
 * --loop: property;
 * --events: event1,event2;
 */

const BIND_SELECTOR = "style[data-x\\:rules='bind']";
const PREFIX_BIND = "--bind-";
const KEY_EVENTS = "--events";
const KEY_LOOP = "--loop";
class BindRule {
  dom = { selector:"" };
  viewModel = { };
  filters = [];

  static createBind(selectorText, domProp, vmProp, filters) {
    const rule = new BindRule();
    rule.dom.selector = selectorText;
    rule.dom.property = domProp;
    rule.viewModel.property = vmProp;
    rule.filters.push(...filters);
    return rule;
  }

  static createEvent(selectorText, event) {
    const rule = new BindRule();
    rule.dom.selector = selectorText;
    rule.dom.event = event;
    return rule;
  }

  static createLoop(selectorText, vmProp) {
    const rule = new BindRule();
    rule.dom.selector = selectorText;
    rule.viewModel.property = vmProp;
    return rule;
  }

  static build(cssRule) {
    const rules = [];
    for(let i = 0; i < cssRule.style.length; i++) {
      const key = cssRule.style[i];
      const value = cssRule.style.getPropertyValue(key).trim();
      if (key === KEY_EVENTS) {
        for(const event of value.split(",")) {
          const eventRule = BindRule.createEvent(
            cssRule.selectorText,
            event
          );
          rules.push(eventRule);
        }
      } else if (key === KEY_LOOP) {
        const loopRule = BindRule.createLoop(
          cssRule.selectorText,
          value
        );
        rules.push(loopRule);
      
      } else if (key.startsWith(PREFIX_BIND)) {
        const values = value.split("|");
        const vmProp = values.shift();
        const filters = values;
        const bindRule = BindRule.createBind(
          cssRule.selectorText,
          key.slice(PREFIX_BIND.length).replaceAll("-", "."),
          vmProp, 
          filters
        );
        rules.push(bindRule);
      }
    }
    return rules;
  }
}

export default class Rules {
  static collect(rootElement) {
    const dummy = document.createElement("div");
    document.body.appendChild(dummy);
    const shadow = dummy.attachShadow({mode:"open"});
    const styleNode = rootElement.querySelector(BIND_SELECTOR);
    shadow.appendChild(styleNode);
    const styleSheetFinder = sheet => sheet.ownerNode === styleNode;
    const styleSheet = Array.from(shadow.styleSheets).find(styleSheetFinder);
    const rules = []
    Array.from(styleSheet?.cssRules ?? []).map(rule => rules.push(...BindRule.build(rule)));
    document.body.removeChild(dummy);
    return rules;
  }

}

