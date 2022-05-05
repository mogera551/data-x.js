import Container from "../Container/Container.js"
import View from "./View.js";
import ViewBuilder from "./ViewBuilder.js";
import ViewUpdater from "./ViewUpdater.js";
import Dependencies from "../ViewModel/Dependency.js";
import Properties from "../ViewModel/Properties.js";
import Notifier from "./Notifier.js";
import Cache from "../ViewModel/Cache.js";

class ViewContainer extends Container {
  registData = [
    ["view", View, "context"],
    ["viewBuilder", ViewBuilder, "context"],
    ["viewUpdater", ViewUpdater, "context"],
    ["dependencies", Dependencies, "context"],
    ["properties", Properties, "context"],
    ["notifier", Notifier, "context"],
    ["cache", Cache, "context"],
  ];
  static create(context) {
    const container = ViewContainer.registAll(new ViewContainer());
    ViewContainer.regist(container, "context", context);
    return container;
  }
}

export default ViewContainer;