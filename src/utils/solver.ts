import type { Board } from "../types/puzzle";
import { GOAL_STATE } from "../types/puzzle";

export type SolveResult = {
  solutionPath: Board[];
  stepsExplored: number;
  timeMs: number;
};

function serialize(board: Board): string {
  return board.join(",");
}

function getNeighbors(board: Board): Board[] {
  const neighbors: Board[] = [];
  const zeroIndex = board.indexOf(0);

  const row = Math.floor(zeroIndex / 3);
  const col = zeroIndex % 3;

  const moves = [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ];

  for (const [newRow, newCol] of moves) {
    if (newRow >= 0 && newRow < 3 && newCol >= 0 && newCol < 3) {
      const newIndex = newRow * 3 + newCol;
      const newBoard = [...board];
      [newBoard[zeroIndex], newBoard[newIndex]] =
        [newBoard[newIndex], newBoard[zeroIndex]];
      neighbors.push(newBoard);
    }
  }

  return neighbors;
}

export function solveWithBFS(start: Board): SolveResult {
  const startTime = performance.now();

  const queue: Board[] = [];
  const visited = new Set<string>();
  const parentMap = new Map<string, string>();

  queue.push(start);
  visited.add(serialize(start));

  let stepsExplored = 0;

  while (queue.length > 0) {
    const current = queue.shift()!;
    stepsExplored++;

    if (serialize(current) === serialize(GOAL_STATE)) {
      const endTime = performance.now();
      const solutionPath = reconstructPath(parentMap, current);
      return {
        solutionPath,
        stepsExplored,
        timeMs: endTime - startTime,
      };
    }

    const neighbors = getNeighbors(current);

    for (const neighbor of neighbors) {
      const key = serialize(neighbor);

      if (!visited.has(key)) {
        visited.add(key);
        parentMap.set(key, serialize(current));
        queue.push(neighbor);
      }
    }
  }

  throw new Error("No solution found");
}

function reconstructPath(
  parentMap: Map<string, string>,
  endBoard: Board
): Board[] {
  const path: Board[] = [];
  let currentKey = serialize(endBoard);

  while (parentMap.has(currentKey)) {
    const board = currentKey.split(",").map(Number);
    path.push(board);
    currentKey = parentMap.get(currentKey)!;
  }

  path.push(currentKey.split(",").map(Number));
  return path.reverse();
}
/* ---------- Manhattan Heuristic ---------- */
function manhattanDistance(board: Board): number {
  let distance = 0;

  for (let i = 0; i < board.length; i++) {
    const value = board[i];

    if (value !== 0) {
      const currentRow = Math.floor(i / 3);
      const currentCol = i % 3;

      const goalRow = Math.floor((value - 1) / 3);
      const goalCol = (value - 1) % 3;

      distance +=
        Math.abs(currentRow - goalRow) +
        Math.abs(currentCol - goalCol);
    }
  }

  return distance;
}
export function solveWithAStar(start: Board): SolveResult {
  const startTime = performance.now();

  const openList: {
    board: Board;
    g: number;
    f: number;
  }[] = [];

  const visited = new Set<string>();
  const parentMap = new Map<string, string>();
  const gScore = new Map<string, number>();

  const startKey = serialize(start);

  openList.push({
    board: start,
    g: 0,
    f: manhattanDistance(start),
  });

  gScore.set(startKey, 0);

  let stepsExplored = 0;

  while (openList.length > 0) {
    // Sort by lowest f value
    openList.sort((a, b) => a.f - b.f);

    const currentNode = openList.shift()!;
    const current = currentNode.board;
    const currentKey = serialize(current);

    stepsExplored++;

    if (currentKey === serialize(GOAL_STATE)) {
      const endTime = performance.now();
      const solutionPath = reconstructPath(parentMap, current);

      return {
        solutionPath,
        stepsExplored,
        timeMs: endTime - startTime,
      };
    }

    visited.add(currentKey);

    const neighbors = getNeighbors(current);

    for (const neighbor of neighbors) {
      const neighborKey = serialize(neighbor);

      if (visited.has(neighborKey)) continue;

      const tentativeG = currentNode.g + 1;

      if (
        !gScore.has(neighborKey) ||
        tentativeG < gScore.get(neighborKey)!
      ) {
        parentMap.set(neighborKey, currentKey);
        gScore.set(neighborKey, tentativeG);

        const fScore =
          tentativeG + manhattanDistance(neighbor);

        openList.push({
          board: neighbor,
          g: tentativeG,
          f: fScore,
        });
      }
    }
  }

  throw new Error("No solution found");
}
export function solveWithDFS(
  start: Board,
  maxDepth: number = 31
): SolveResult {
  const startTime = performance.now();

  const visited = new Set<string>();
  const parentMap = new Map<string, string>();

  let stepsExplored = 0;
  let foundGoal: Board | null = null;

  function dfs(current: Board, depth: number): boolean {
    const key = serialize(current);

    if (visited.has(key)) return false;

    visited.add(key);
    stepsExplored++;

    if (key === serialize(GOAL_STATE)) {
      foundGoal = current;
      return true;
    }

    if (depth >= maxDepth) return false;

    const neighbors = getNeighbors(current);

    for (const neighbor of neighbors) {
      const neighborKey = serialize(neighbor);

      if (!visited.has(neighborKey)) {
        parentMap.set(neighborKey, key);

        if (dfs(neighbor, depth + 1)) {
          return true;
        }
      }
    }

    return false;
  }

  dfs(start, 0);

  if (!foundGoal) {
    throw new Error("DFS did not find solution within depth limit");
  }

  const endTime = performance.now();
  const solutionPath = reconstructPath(parentMap, foundGoal);

  return {
    solutionPath,
    stepsExplored,
    timeMs: endTime - startTime,
  };
}