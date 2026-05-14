import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

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

  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (gameOver) return;

    intervalRef.current = setInterval(update, 200);

    return () => clearInterval(intervalRef.current);
  }, [snake, direction, gameOver]);

  function spawnFood() {
    return {
      x: Math.floor(Math.random() * SIZE),
      y: Math.floor(Math.random() * SIZE),
    };
  }

  function update() {
    let head = { ...snake[0] };

    if (direction === "LEFT") head.x--;
    if (direction === "RIGHT") head.x++;
    if (direction === "UP") head.y--;
    if (direction === "DOWN") head.y++;

    // Kolizja ze ścianą
    if (
      head.x < 0 ||
      head.y < 0 ||
      head.x >= SIZE ||
      head.y >= SIZE
    ) {
      endGame();
      return;
    }

    // Kolizja z samym sobą
    if (snake.some((s) => s.x === head.x && s.y === head.y)) {
      endGame();
      return;
    }

    let newSnake = [head, ...snake];

    // Zjedzenie jedzenia
    if (head.x === food.x && head.y === food.y) {
      setScore(score + 1);
      setFood(spawnFood());
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }

  function endGame() {
    clearInterval(intervalRef.current);
    setGameOver(true);
  }

  function resetGame() {
    setSnake(START_SNAKE);
    setFood(spawnFood());
    setScore(0);
    setDirection("RIGHT");
    setGameOver(false);
  }

  return (
    <View style={styles.container}>
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
            <Text style={styles.arrowText}>"<-"</Text>
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

        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetGame}
        >
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
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },

  gameOverOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
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
});