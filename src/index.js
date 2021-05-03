import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import Header from './Header'

ReactDOM.render(
  <React.StrictMode>
    <header>
      <Header />
    </header>
    <div className="container-fluid">
      <App />
    </div>
  </React.StrictMode>,
  document.getElementById("root")
);
