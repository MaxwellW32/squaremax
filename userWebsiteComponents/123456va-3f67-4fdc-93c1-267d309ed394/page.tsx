import { containersType } from '@/types';
import React from 'react';
import './page.css';

export default function ContainOne({ data }: { data: containersType }) {
  const renderElements = (elements: React.ReactElement[]) => {
    return elements.map((element, index) => {
      const { type, props } = element;

      // Create the element dynamically, using the index as a fallback key
      return React.createElement(type, { ...props, key: element.key || index });
    });
  };

  return (
    <div {...data.mainElProps} className={`${data.styleId}container ${data.mainElProps.className ?? ""}`}
    >
      <h1 className={`${data.styleId}container-header`}>This is my element with children</h1>

      <div className={`${data.styleId}container-grid`}>
        <p className={`${data.styleId}container-grid-item`}>Can have anything here</p>
        <p className={`${data.styleId}container-grid-item`}>Text 2</p>
        <p className={`${data.styleId}container-grid-item`}>Text 3</p>
      </div>

      <div className={`${data.styleId}container-children`}>
        {renderElements(data.children)}
      </div>

      <p className={`${data.styleId}container-footer`}>This is text below the children</p>
    </div>

  );
}
