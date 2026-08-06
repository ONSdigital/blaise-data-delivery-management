import { type ReactElement } from "react";
import { Link } from "react-router-dom";

function Breadcrumbs(): ReactElement {
  return (
    <nav
      className="ons-breadcrumb ons-u-mt-m ons-u-mb-m"
      aria-label="Breadcrumb"
    >
      <span aria-hidden="true">&lt; </span>
      <Link
        className="ons-breadcrumb__link ons-u-fs-s"
        to="/"
      >
        Home
      </Link>
    </nav>
  );
}

export default Breadcrumbs;
