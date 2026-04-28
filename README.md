# Counter Factory — Паттерни замикань

> Практична робота 9.1 · Варіант 1 · Замикання в JavaScript

## Опис

Система лічильників реалізована через паттерн замикань. Всі змінні стану (`count`, `history`, `_step`) є приватними — зберігаються у замиканні і недоступні ззовні без публічних методів.

## Запуск

```bash
start index.html   # Windows
open index.html    # macOS
```

---

## Паттерн замикання

```js
const createCounter = (initial = 0) => {
  let count = initial; // ← приватна змінна у замиканні

  return {
    increment() { return ++count; }, // ← доступ через метод
    get()       { return count;    },
  };
};

const c = createCounter(0);
c.increment(); // → 1
c.count;       // → undefined (приватна!)
```

---

## API Reference

### `createCounter(initial = 0)`

Базовий лічильник.

```js
const c = createCounter(5);
c.increment(); // → 6
c.decrement(); // → 5
c.get();       // → 5
c.reset();     // → 5  (повертається до initial)
c.count;       // → undefined ✓ (приватна змінна)
```

---

### `createLimitedCounter(min, max, initial?)`

Не виходить за межі [min, max]. Валідація при створенні.

```js
const c = createLimitedCounter(0, 3);
c.increment(); // → 1
c.increment(); // → 2
c.increment(); // → 3
c.increment(); // → 3  (не виходить за max)
c.isMax();     // → true
c.isMin();     // → false
c.getRange();  // → { min: 0, max: 3 }

// Валідація:
createLimitedCounter(5, 2);     // RangeError: min > max
createLimitedCounter(0, 3, 10); // RangeError: initial out of range
```

---

### `createStepCounter(step = 1, initial = 0)`

Крок збільшення/зменшення можна змінювати динамічно.

```js
const c = createStepCounter(5);
c.increment(); // → 5
c.increment(); // → 10
c.setStep(2);
c.increment(); // → 12
c.getStep();   // → 2
c.reset();     // → 0

// Валідація:
createStepCounter(-1); // RangeError: step має бути > 0
```

---

### `createNamedCounter(name, initial = 0)`

Зберігає приватну історію всіх змін. `getHistory()` повертає захисну копію.

```js
const c = createNamedCounter('score', 0);
c.increment();
c.increment();
c.decrement();

c.getName();    // → 'score'
c.historySize(); // → 3

c.getHistory();
// → [
//   { action: 'increment', from: 0, to: 1, timestamp: '...' },
//   { action: 'increment', from: 1, to: 2, timestamp: '...' },
//   { action: 'decrement', from: 2, to: 1, timestamp: '...' },
// ]

// Захист від зовнішньої модифікації:
const h = c.getHistory();
h.push({ fake: true }); // не впливає на оригінал
c.historySize(); // → 3 (незмінно)

c.clearHistory();
c.historySize(); // → 0
```

---

## Приватний стан — доказ

```js
const c = createCounter(0);
c.count;    // undefined — змінна недоступна ззовні
c.initial;  // undefined

const lc = createLimitedCounter(0, 5);
lc.min;     // undefined
lc.max;     // undefined

const nc = createNamedCounter('x');
nc.history; // undefined — масив недоступний напряму
```

---

## Demo відео

> 📹 [Посилання на відео-демонстрацію](#)

---

## Критерії оцінювання

| Критерій | Бали | Статус |
|----------|------|--------|
| Правильне використання замикань | 3 | ✅ |
| Приватні змінні та інкапсуляція | 2.5 | ✅ count, history, _step — у замиканні |
| Функціональність | 2 | ✅ всі 4 лічильники |
| Якість коду | 1.5 | ✅ JSDoc, валідація, захисні копії |
| README з поясненнями | 0.5 | ✅ |
| Demo відео | 0.5 | ⬜ |
| **Всього** | **10** | |
