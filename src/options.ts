import { render } from "preact";
import App from "./OptionsApp";

const appRootElement = document.querySelector("#appRoot")!;

render(App(), appRootElement);
