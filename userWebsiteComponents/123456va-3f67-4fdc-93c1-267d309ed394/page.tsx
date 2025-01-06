import { containersType } from '@/types'
import React from 'react'

export default function ContainOne({ data }: { data: containersType }) {

  const renderElements = (elements: React.ReactElement[]) => {
    return elements.map((element, elementIndex) => {
      const { type, key, props } = element;

      let seenKey = key
      if (seenKey === null) {
        seenKey = `${elementIndex}`
      }

      return React.createElement(type, { ...props, key });
    });
  };

  return (
    <div style={{ backgroundColor: "orange" }}>
      <h1>This is my element with children</h1>

      <div style={{ display: "grid" }}>
        <p>Can have anything here</p>
        <p>text 2</p>
        <p>text 3</p>
      </div>

      {renderElements(data.children)}

      <p>This is text below the children</p>
    </div>
  )
}
