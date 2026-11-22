import React from 'react';
import { Link } from 'react-router-dom';
import notFoundVideo from '../../../assets/not_found_video.mp4';
import Footer from '../Components/Footer.jsx';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="amz-notfound-page">
      <main className="amz-notfound-main">
        {/* Seamless cavemen volleyball animation */}
        <div className="amz-notfound-video-wrap">
          <video
            src={notFoundVideo || '/not_found_video.mp4'}
            autoPlay
            loop
            muted
            playsInline
            className="amz-notfound-video"
          />
          {/* Mask to eliminate any black line artifact on video edges */}
          <div className="amz-video-edge-mask right"></div>
          <div className="amz-video-edge-mask left"></div>
          <div className="amz-video-edge-mask top"></div>
          <div className="amz-video-edge-mask bottom"></div>
        </div>

        {/* 404 Headline & Subtext */}
        <h1 className="amz-notfound-code">404</h1>
        <h2 className="amz-notfound-title">Oops! Wrong Court.</h2>
        <p className="amz-notfound-subtext">Looks like this page went out of bounds.</p>

        {/* Orange Pill Button */}
        <Link to="/" className="amz-notfound-home-btn">
          <span className="amz-notfound-arrow">←</span> Back to Home
        </Link>
      </main>

      {/* Footer matching design */}
      <Footer />
    </div>
  );
};

export default NotFound;
