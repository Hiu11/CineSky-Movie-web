import React from 'react';
import './CinematicBackdrop.css';

const cinematicParticles = [
  [3, 8, 1], [7, 31, 1.4], [11, 63, 1], [14, 17, 2], [19, 82, 1.2],
  [23, 44, 1], [28, 12, 1.6], [31, 71, 1], [36, 29, 1.3], [41, 91, 1.8],
  [45, 53, 1], [49, 22, 1.5], [53, 77, 1], [58, 36, 2], [63, 14, 1],
  [67, 67, 1.4], [72, 48, 1], [76, 9, 1.7], [81, 86, 1.2], [86, 27, 1],
  [91, 58, 1.6], [96, 74, 1], [5, 91, 1.3], [16, 48, 1], [26, 57, 1.7],
  [39, 6, 1], [52, 9, 1.2], [61, 88, 1.5], [74, 73, 1], [88, 12, 2],
].map(([left, top, size], index) => ({
  id: index,
  left: `${left}%`,
  top: `${top}%`,
  size: `${size}px`,
  delay: `${(index % 10) * -0.63}s`,
  duration: `${9 + (index % 7)}s`,
}));

export default function CinematicBackdrop({ withFilmStrips = false }) {
  return (
    <div className="home-cinematic-backdrop" aria-hidden="true">
      <div className="home-cinematic-backdrop__grain"></div>
      <div className="home-cinematic-backdrop__light home-cinematic-backdrop__light--gold"></div>
      <div className="home-cinematic-backdrop__light home-cinematic-backdrop__light--blue"></div>
      <div className="home-cinematic-backdrop__beam home-cinematic-backdrop__beam--left"></div>
      <div className="home-cinematic-backdrop__beam home-cinematic-backdrop__beam--right"></div>
      <div className="home-cinematic-backdrop__orb home-cinematic-backdrop__orb--one"></div>
      <div className="home-cinematic-backdrop__orb home-cinematic-backdrop__orb--two"></div>
      
      {withFilmStrips && (
        <>
          <div className="home-cinematic-backdrop__film home-cinematic-backdrop__film--left"></div>
          <div className="home-cinematic-backdrop__film home-cinematic-backdrop__film--right"></div>
        </>
      )}
      
      <div className="home-cinematic-backdrop__particles">
        {cinematicParticles.map((particle) => (
          <span
            key={particle.id}
            style={{
              "--particle-left": particle.left,
              "--particle-top": particle.top,
              "--particle-size": particle.size,
              "--particle-delay": particle.delay,
              "--particle-duration": particle.duration,
            }}
          ></span>
        ))}
      </div>
    </div>
  );
}
