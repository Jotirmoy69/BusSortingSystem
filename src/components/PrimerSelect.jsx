import React from "react";
import { Select } from "@primer/react";

function convertChildren(children) {
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    if (child.type === "option") {
      return (
        <Select.Option {...child.props}>
          {child.props.children}
        </Select.Option>
      );
    }
    return child;
  });
}

export default function PrimerSelect({ children, ...props }) {
  return <Select {...props}>{convertChildren(children)}</Select>;
}
