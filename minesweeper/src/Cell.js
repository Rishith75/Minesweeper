import React from 'react';
import './App.css';

const Cell = ({ cell, onClick, onContextMenu, className }) => {
  return (
    <div
      className={className}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {cell.isRevealed && !cell.isMine && cell.adjacentMines > 0 && cell.adjacentMines}
      {cell.isRevealed && cell.isMine && '💣'}
      {cell.isFlagged && !cell.isRevealed && '🚩'}
    </div>
  );
};

export default Cell;
