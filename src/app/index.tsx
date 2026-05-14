import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SIZE = 20;
const BOX = 18;

const START_SNAKE = [
  { x: 9, y: 10 },
  { x: 8, y: 10 },
  { x: 7, y: 10 },
  { x: 6, y: 10 },
  { x: 5, y: 10 },
];

export default function Home() {
  const [snake, setSnake] = useState(START_SNAKE);
  const [food, setFood] = useState(spawnFood());
  const [direction, setDirection] = useState("RIGHT");
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const [playerName, setPlayerName] = useState("");
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [bestScore, setBestScore] = useState(0);

  const intervalRef = useRef<any>(null);
  const foodTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (gameOver || !isGameStarted) return;

    intervalRef.current = setInterval(update, 200);
    return () => clearInterval(intervalRef.current);
  }, [snake, direction, gameOver, isGameStarted]);

  function spawnFood() {
    return {
      x: Math.floor(Math.random() * SIZE),
      y: Math.floor(Math.random() * SIZE),
    };
  }

  async function loadBestScore(name: string) {
    try {
      const key = `bestScore_${name}`;
      const stored = await AsyncStorage.getItem(key);
      setBestScore(stored ? parseInt(stored) : 0);
    } catch {}
  }

  async function saveBestScore(newScore: number) {
    try {
      const key = `bestScore_${playerName}`;
      const stored = await AsyncStorage.getItem(key);
      const currentBest = stored ? parseInt(stored) : 0;

      if (newScore > currentBest) {
        await AsyncStorage.setItem(key, newScore.toString());
        setBestScore(newScore);
      } else {
        setBestScore(currentBest);
      }
    } catch {}
  }

  function update() {
    let head = { ...snake[0] };

    if (direction === "LEFT") head.x--;
    if (direction === "RIGHT") head.x++;
    if (direction === "UP") head.y--;
    if (direction === "DOWN") head.y++;

    if (
      head.x < 0 ||
      head.y < 0 ||
      head.x >= SIZE ||
      head.y >= SIZE
    ) {
      endGame();
      return;
    }

    if (snake.some((s) => s.x === head.x && s.y === head.y)) {
      endGame();
      return;
    }

    let newSnake = [head, ...snake];

    if (food && head.x === food.x && head.y === food.y) {
      setScore((prev) => prev + 1);
      setFood(null);

      if (foodTimeoutRef.current) {
        clearTimeout(foodTimeoutRef.current);
      }

      foodTimeoutRef.current = setTimeout(() => {
        setFood(spawnFood());
      }, 3000);

    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }

  function endGame() {
    clearInterval(intervalRef.current);

    if (foodTimeoutRef.current) {
      clearTimeout(foodTimeoutRef.current);
    }

    setGameOver(true);
    saveBestScore(score);
  }

  function resetGame() {
    clearInterval(intervalRef.current);

    if (foodTimeoutRef.current) {
      clearTimeout(foodTimeoutRef.current);
    }

    setSnake(START_SNAKE);
    setFood(spawnFood());
    setScore(0);
    setDirection("RIGHT");
    setGameOver(false);
    setIsGameStarted(false);
  }

  if (!isGameStarted) {
    return (
      <View style={styles.container}>
        <Text style={styles.score}>Podaj swoje imię</Text>

        <TextInput
          style={styles.input}
          placeholder="Twoje imię"
          placeholderTextColor="#aaa"
          value={playerName}
          onChangeText={setPlayerName}
        />

        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => {
            if (playerName.trim().length === 0) return;
            loadBestScore(playerName);
            setIsGameStarted(true);
          }}
        >
          <Text style={styles.resetText}>Start</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.score}>Gracz: {playerName}</Text>
      <Text style={styles.score}>Best: {bestScore}</Text>
      <Text style={styles.score}>Score: {score}</Text>

      <View style={styles.board}>
        {snake.map((s, i) => (
          <View
            key={i}
            style={[
              styles.cell,
              {
                left: s.x * BOX,
                top: s.y * BOX,
                backgroundColor: i === 0 ? "lime" : "green",
              },
            ]}
          />
        ))}

        {food && (
          <View
            style={[
              styles.cell,
              {
                left: food.x * BOX,
                top: food.y * BOX,
                backgroundColor: "red",
              },
            ]}
          />
        )}

        {gameOver && (
          <View style={styles.gameOverOverlay}>
            <Text style={styles.gameOver}>GAME OVER</Text>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.arrowButton}
          onPress={() => !gameOver && setDirection("UP")}
        >
          <Text style={styles.arrowText}>↑</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => !gameOver && setDirection("LEFT")}
          >
            <Text style={styles.arrowText}>←</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => !gameOver && setDirection("RIGHT")}
          >
            <Text style={styles.arrowText}>→</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.arrowButton}
          onPress={() => !gameOver && setDirection("DOWN")}
        >
          <Text style={styles.arrowText}>↓</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
          <Text style={styles.resetText}>Nowa gra</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2f76af",
    alignItems: "center",
    justifyContent: "center",
  },
  board: {
    width: BOX * SIZE,
    height: BOX * SIZE,
    backgroundColor: "black",
    position: "relative",
    borderWidth: 2,
    borderColor: "#fff",
    overflow: "hidden",
  },
  cell: {
    width: BOX,
    height: BOX,
    position: "absolute",
    borderRadius: 4,
  },
  score: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  gameOverOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  gameOver: {
    color: "red",
    fontSize: 36,
    fontWeight: "bold",
  },
  controls: {
    marginTop: 25,
    alignItems: "center",
  },
  arrowButton: {
    width: 65,
    height: 65,
    backgroundColor: "#111",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    margin: 6,
    borderWidth: 2,
    borderColor: "#444",
  },
  arrowText: {
    color: "white",
    fontSize: 34,
    fontWeight: "bold",
  },
  resetButton: {
    marginTop: 18,
    backgroundColor: "#111",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#444",
  },
  resetText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  input: {
    width: 220,
    height: 50,
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 18,
    marginBottom: 15,
  },
});