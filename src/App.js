import React, { useState, useMemo } from "react";
import './App.css';

// Значение для клеток с миной
const Mine = -1;

// Объект перечисления для масок клеток
const Mask = {
  Transparent: 0,
  Fill: 1,
  Flag: 2,
  Question: 3,
};

// Соответствие маски клетки и ее отображения
const mapMaskToView = {
  [Mask.Transparent]: null,
  [Mask.Fill]: "🌿",
  [Mask.Flag]: "🚩",
  [Mask.Question]: "❓️",
};

// Функция для создания игрового поля
function createField(size) {
  const field = new Array(size * size).fill(0);

  // Функция инкремента для соседних клеток
  function inc(x, y) {
    if (x >= 0 && x < size && y >= 0 && y < size) {
      if (field[y * size + x] === Mine) {
        return;
      }
      field[y * size + x] += 1;
    }
  }

  // Расставляем мины и обновляем значения клеток вокруг
  for (let i = 0; i < size; i++) {
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);
    
    if (field[y * size + x] === Mine) {
      continue;
    } else {
      field[y * size + x] = Mine;
      inc(x + 1, y);
      inc(x - 1, y);
      inc(x, y + 1);
      inc(x, y - 1);
      inc(x + 1, y - 1);
      inc(x - 1, y - 1);
      inc(x + 1, y + 1);
      inc(x - 1, y + 1);
    }
  }

  return field;
}

// Основной компонент приложения
function App() {
  const size = 10;
  const dimension = new Array(size).fill(null);
  const [death, setDeath] = useState(false);
  const [field] = useState(() => createField(size));
  const [win, setWin] = useState(false);
  const [mask, setMask] = useState(() => new Array(size * size).fill(Mask.Fill));

  // Проверяем условие победы
  useMemo(() => {
    return field.some((f, i) => f === Mine && mask[i] !== Mask.Flag && mask[i] !== Mask.Transparent);
  }, [field, mask]);

  return (
    <main>
      {dimension.map((_, y) => (
        <div key={y} style={{ display: "flex" }}>
          {dimension.map((_, x) => (
            <div key={x} style={{ display: "flex", justifyContent: "center", alignItems: "center", width: 65, height: 65, margin: 2, backgroundColor: death ? "#FAA" : win ? "#FFB" : "#BEB" }}
              onClick={() => {
                if (mask[y * size + x] === Mask.Transparent) {
                  return;
                }

                const clearing = [];

                // Функция для очистки соседних пустых клеток
                function clear(x, y) {
                  if (x >= 0 && y < size && x < size && y >= 0 && y < size) {
                    if (mask[y * size + x] === Mask.Transparent) return;
                    clearing.push([x, y]);
                  }
                }

                clear(x, y);

                while (clearing.length) {
                  const [x, y] = clearing.pop();

                  mask[y * size + x] = Mask.Transparent;

                  if (field[y * size + x] !== 0) continue;

                  clear(x + 1, y);
                  clear(x - 1, y);
                  clear(x, y + 1);
                  clear(x, y - 1);
                }

                if (field[y * size + x] === Mine) {
                  alert("Game Over!");
                  mask.forEach((_, i) => mask[i] = Mask.Transparent);
                  setDeath(true);
                }

                setMask((prev) => [...prev]);
              }}

              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();

                if (mask[y * size + x] === Mask.Transparent) return;

                if (mask[y * size + x] === Mask.Fill) {
                  mask[y * size + x] = Mask.Flag;
                } else if (mask[y * size + x] === Mask.Flag) {
                  mask[y * size + x] = Mask.Question;
                } else if (mask[y * size + x] === Mask.Question) {
                  mask[y * size + x] = Mask.Fill;
                }

                setMask((prev) => [...prev]);
              }}
            >
              {mapMaskToView[mask[y * size + x]] || (field[y * size + x] === Mine ? "💣" : field[y * size + x] > 0 ? field[y * size + x] : "")}
            </div>
          ))}
        </div>
      ))}
    </main>
  );
}

export default App;