import React from 'react';
import ReactDOM from 'react-dom';

export function isDOM(node: any) {
  return node instanceof HTMLElement || node instanceof SVGElement;
}

export default function findDOMNode(node) {
  if (isDOM(node)) {
    return node;
  }

  if (node instanceof React.Component) {
    return ReactDOM.findDOMNode(node);
  }

  return null;
}
