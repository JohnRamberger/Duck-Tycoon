import { GameEngine } from 'react-game-engine';
import { useState, useEffect } from 'react';

export const Minigame1Screen = () => {
  const [screen, setScreen] = useState<{
    width: number;
    height: number;
  }>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    window.addEventListener('resize', (e) => {
      setScreen({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    });
  }, []);

  return (
    <GameEngine
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: 'transparent',
      }}
    ></GameEngine>
  );
};
