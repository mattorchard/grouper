import { render } from "preact";
import App from "./PopupApp";

const appRootElement = document.querySelector("#appRoot")!;

render(App(), appRootElement);
