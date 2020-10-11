import * as React from "react";
import * as ReactDOM from "react-dom";

import { App } from "./components/App";
import "./style/style.scss"
const ROOT = document.querySelector(".container");

ReactDOM.render(<App name="Learning Website"/>, ROOT);