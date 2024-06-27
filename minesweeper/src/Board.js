import React, { useState, useEffect } from 'react';
import Cell from './Cell';
import Modal from './Modal'; // Import the Modal component
import './App.css';

const Board = () => {
  const [board, setBoard] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [minTime, setMinTime] = useState(Number(localStorage.getItem('minTime')) || Infinity);
  const [isFlagMode, setIsFlagMode] = useState(false); // Flag or Cell mode toggle
  const [flagCount, setFlagCount] = useState(10); // Initial flag count
  const [showModal, setShowModal] = useState(false); // Modal state

  useEffect(() => {
    initializeBoard();
  }, []);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const initializeBoard = () => {
    const newBoard = Array(10)
      .fill(null)
      .map(() =>
        Array(10).fill(null).map(() => ({
          isMine: false,
          isRevealed: false,
          isFlagged: false, // Track if the cell is flagged
          adjacentMines: 0,
        }))
      );

    placeMines(newBoard, 10);
    calculateAdjacentMines(newBoard);
    setBoard(newBoard);
    setGameOver(false);
    setGameWon(false);
    setTimer(0);
    setIsTimerRunning(false);
    setFlagCount(10); // Reset flag count on restart
    setShowModal(false); // Reset modal state
  };

  const placeMines = (board, mineCount) => {
    let placedMines = 0;
    while (placedMines < mineCount) {
      const row = Math.floor(Math.random() * 10);
      const col = Math.floor(Math.random() * 10);
      if (!board[row][col].isMine) {
        board[row][col].isMine = true;
        placedMines++;
      }
    }
  };

  const calculateAdjacentMines = (board) => {
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        if (!board[row][col].isMine) {
          let mineCount = 0;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (
                row + i >= 0 &&
                row + i < 10 &&
                col + j >= 0 &&
                col + j < 10 &&
                board[row + i][col + j].isMine
              ) {
                mineCount++;
              }
            }
          }
          board[row][col].adjacentMines = mineCount;
        }
      }
    }
  };

  const handleCellClick = (row, col) => {
    if (gameOver || gameWon || board[row][col].isRevealed) return;

    let newBoard = board.map((row) =>
      row.map((cell) => ({
        ...cell,
      }))
    );

    if (!isTimerRunning) {
      setIsTimerRunning(true); // Start the timer on first cell click
    }

    if (isFlagMode) {
      if (!newBoard[row][col].isRevealed) {
        newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
        setFlagCount(flagCount + (newBoard[row][col].isFlagged ? -1 : 1));
      }
    } else {
      if (newBoard[row][col].isMine) {
        setGameOver(true);
        setIsTimerRunning(false);
        revealBoard(newBoard);
        setShowModal(true); // Show modal on game over
      } else {
        revealCell(newBoard, row, col);
        if (checkWin(newBoard)) {
          setGameWon(true);
          setIsTimerRunning(false);
          revealBoard(newBoard);
          setShowModal(true); // Show modal on game win
          if (timer < minTime) {
            setMinTime(timer);
            localStorage.setItem('minTime', timer);
          }
        }
      }
    }

    setBoard(newBoard);
  };

  const revealCell = (board, row, col) => {
    if (
      row < 0 ||
      row >= 10 ||
      col < 0 ||
      col >= 10 ||
      board[row][col].isRevealed
    )
      return;
    board[row][col].isRevealed = true;
    if (board[row][col].adjacentMines === 0) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (
            row + i >= 0 &&
            row + i < 10 &&
            col + j >= 0 &&
            col + j < 10
          ) {
            if (
              !board[row + i][col + j].isMine &&
              !board[row + i][col + j].isRevealed
            ) {
              revealCell(board, row + i, col + j);
            }
          }
        }
      }
    }
  };

  const revealBoard = (board) => {
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        board[row][col].isRevealed = true;
      }
    }
  };

  const checkWin = (board) => {
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        if (!board[row][col].isMine && !board[row][col].isRevealed) {
          return false;
        }
      }
    }
    return true;
  };

  const toggleMode = () => {
    setIsFlagMode(!isFlagMode); // Toggle between flag mode and cell mode
  };

  return (
    <div className="app-container">
      <h1 className="game-title">Minesweeper</h1>
      <div className="Navbar">
        <div className="clock">
          <img src="clock.png" alt="clock" className="clock-icon" /> {timer} seconds
        </div>
        <div className="flag">
          <img src="flag.png" alt="flag" className="flag-icon" />{flagCount}
        </div>
      </div>
      <div className="board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <Cell
                key={colIndex}
                cell={cell}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={`cell ${cell.isRevealed ? 'revealed' : ''} ${cell.isFlagged && !cell.isRevealed ? 'flagged' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="game-info">
        <button className="mode-toggle" onClick={toggleMode}>
          {isFlagMode ? 'Cell Mode' : 'Flag Mode'}
        </button>
        <button className="restart-button" onClick={initializeBoard}>
          Restart
        </button>
      </div>
      <Modal
        show={showModal}
        onClose={initializeBoard} // Restart the game when modal is closed
        title={gameWon ? 'YOU WON' : 'YOU LOST'}
      >
        {gameWon ? (
          <div>
            <img src="clock.png" alt="clock" className="clock-icon" /> {timer} seconds
            <br />
            <img src="Best_Score.png" alt="clock" className="clock-icon" /> {minTime === Infinity ? 'N/A' : `${minTime} seconds`}
          </div>
        ) : (
          'Better luck next time!'
        )}
      </Modal>
    </div>
  );
};

export default Board;
