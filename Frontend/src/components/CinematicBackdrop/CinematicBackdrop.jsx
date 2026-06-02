import React from 'react';
import './CinematicBackdrop.css';

const cinematicParticles = Array.from({ length: 42 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  top: `${(index * 53) % 100}%`,
  size: `${1 + (index % 3)}px`,
  delay: `${(index % 9) * -0.7}s`,
  duration: `${8 + (index % 6)}s`,
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
