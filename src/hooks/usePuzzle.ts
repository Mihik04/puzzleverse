import { useState, useEffect } from "react";
import type { Board } from "../types/puzzle";
import { GOAL_STATE } from "../types/puzzle";

export function usePuzzle() {

  // Current board state
  const [board, setBoard] = useState<Board>(GOAL_STATE);

  // Track number of moves
  const [moves, setMoves] = useState<number>(0);

  const [seconds, setSeconds] = useState<number>(0);
const [isRunning, setIsRunning] = useState<boolean>(false);
useEffect(() => {
  shuffle();
}, []);
  // Check if puzzle is solved
  const isSolved = board.every(
    (value, index) => value === GOAL_STATE[index]
  );
  useEffect(() => {
  if (isSolved) {
    setIsRunning(false);
  }
}, [isSolved]);
  useEffect(() => {
  let interval: number | undefined;

  if (isRunning) {
    interval = window.setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  }

  return () => {
    if (interval) clearInterval(interval);
  };
}, [isRunning]);

  // Get index of empty tile (0)
  function getEmptyIndex(currentBoard: Board): number {
    return currentBoard.indexOf(0);
  }

  // Check if two indices are adjacent
  function isAdjacent(index1: number, index2: number): boolean {
    const row1 = Math.floor(index1 / 3);
    const col1 = index1 % 3;

    const row2 = Math.floor(index2 / 3);
    const col2 = index2 % 3;

    return (
      (row1 === row2 && Math.abs(col1 - col2) === 1) ||
      (col1 === col2 && Math.abs(row1 - row2) === 1)
    );
  }

  // Move tile if valid
  function moveTile(index: number) {
    const emptyIndex = getEmptyIndex(board);

    // If not adjacent, do nothing
    if (!isAdjacent(index, emptyIndex)) return;

    const newBoard = [...board];

    // Swap tile with empty space
    [newBoard[index], newBoard[emptyIndex]] = [
      newBoard[emptyIndex],
      newBoard[index],
    ];

    setBoard(newBoard);
   setMoves((prev) => {
  if (prev === 0) {
    setIsRunning(true);
  }
  return prev + 1;
});
  }
  function countInversions(arr: Board): number {
  let inversions = 0;

  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (
        arr[i] !== 0 &&
        arr[j] !== 0 &&
        arr[i] > arr[j]
      ) {
        inversions++;
      }
    }
  }

  return inversions;
}

  // Shuffle board randomly
function shuffle() {
  let shuffled: Board;

  do {
    shuffled = [...GOAL_STATE].sort(
      () => Math.random() - 0.5
    );
  } while (countInversions(shuffled) % 2 !== 0);
  setSeconds(0);
  setIsRunning(false); 
  setBoard(shuffled);
  setMoves(0);
}

return {
  board,
  moves,
  seconds,
  isSolved,
  moveTile,
  shuffle,
};
}