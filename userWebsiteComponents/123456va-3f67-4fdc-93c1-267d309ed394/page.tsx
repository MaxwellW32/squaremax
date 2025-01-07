import { containersType } from '@/types';
import React from 'react';

export default function ContainOne({ data }: { data: containersType }) {
  const renderElements = (elements: React.ReactElement[]) => {
    return elements.map((element, index) => {
      const { type, props } = element;

      // Create the element dynamically, using the index as a fallback key
      return React.createElement(type, { ...props, key: element.key || index });
    });
  };

  return (
    <div
      className="container"
      style={{
        border: '2px solid #ddd',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#f9f9f9',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1 style={{
        color: '#333',
        fontSize: '1.5rem',
        textAlign: 'center',
        marginBottom: '1rem',
      }}>
        This is my element with children
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '10px',
          marginBottom: '1rem',
        }}
      >
        <p style={{
          backgroundColor: '#ffffff',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}>Can have anything here</p>
        <p style={{
          backgroundColor: '#ffffff',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}>Text 2</p>
        <p style={{
          backgroundColor: '#ffffff',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}>Text 3</p>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        {renderElements(data.children)}
      </div>

      <p style={{
        textAlign: 'center',
        fontSize: '1rem',
        color: '#555',
        marginTop: '1rem',
      }}>This is text below the children</p>
    </div>
  );
}
