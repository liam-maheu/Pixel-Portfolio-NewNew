import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Phaser from 'phaser';
import { config } from './game/config';
import UI from './components/UI';
import './App.css';

function App() {
  const { isModalOpen } = useSelector((state) => state.ui);

  useEffect(() => {
    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div className="app-container">
      <div id="game-container" />
      <UI />
    </div>
  );
}

export default App; 