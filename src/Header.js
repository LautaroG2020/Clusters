import React from "react";
import "./css/Header.css";
import "bootstrap/dist/css/bootstrap.css";

const Header = () => {
  return (
    <nav className="navbar">
      <div className="container-fluid">
        <span className="navbar-brand mb-0 h1">Clusters en GoogleMaps</span>
      </div>
    </nav>
  );
};

export default Header;