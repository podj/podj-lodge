import React from 'react';
import '../styles/Loader.css';

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader-content">
        <div className="loader-logo">PODJ LODGE</div>
        <div className="loader-spinner">
          <div className="spinner-ring"></div>
        </div>
        <div className="loader-text">Curating your luxury experience...</div>
      </div>
    </div>
  );
};

export default Loader; 