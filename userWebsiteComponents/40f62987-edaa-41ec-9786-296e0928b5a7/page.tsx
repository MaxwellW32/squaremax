import { containersType } from '@/types';
import React from 'react';
import './page.css';

export default function ContainOne({ data }: { data: containersType }) {
  // const renderElements = (elements: React.ReactElement[]) => {
  //   return elements.map((element, index) => {
  //     const { type, props } = element;

  //     // Create the element dynamically, using the index as a fallback key
  //     return React.createElement(type, { ...props, key: element.key || index });
  //   });
  // };

  return (
    <div {...data.mainElProps} className={`container${data.styleId} ${data.mainElProps.className ?? ""}`}
    >
      <h1 className={`container-header${data.styleId}`}>This is my element with children</h1>

      <div className={`container-grid${data.styleId}`}>
        <p className={`container-grid-item${data.styleId}`}>Can have anything here</p>
        <p className={`container-grid-item${data.styleId}`}>Text 2</p>
        <p className={`container-grid-item${data.styleId}`}>Text 3</p>
      </div>

      <div className={`container-children${data.styleId}`}>
        {data.children}
        {/* {renderElements(data.children)} */}
      </div>

      <p className={`container-footer${data.styleId}`}>This is text below the children</p>
    </div>

  );
}