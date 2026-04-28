/**
 * @fileoverview Практична робота 9.1 — Паттерни замикань
 * Варіант 1: Counter Factory
 *
 * Всі змінні стану приватні — зберігаються в замиканні,
 * недоступні зовні без методів публічного API.
 */

// ═══════════════════════════════════════════════════════════════
//  1. createCounter — базовий лічильник
// ═══════════════════════════════════════════════════════════════

/**
 * Базовий лічильник з приватним станом.
 *
 * @param {number} [initial=0] — початкове значення
 * @returns {{ increment: Function, decrement: Function,
 *             get: Function, reset: Function }}
 *
 * @example
 * const c = createCounter(5);
 * c.increment(); // → 6
 * c.decrement(); // → 5
 * c.reset();     // → 5 (повертається до initial)
 * c.count        // → undefined (приватна змінна)
 */
const createCounter = (initial = 0) => {
  // ── приватна змінна ──────────────────────────────────────────
  let count = initial;
  // ────────────────────────────────────────────────────────────

  return {
    /** @returns {number} нове значення після збільшення */
    increment() { return ++count; },

    /** @returns {number} нове значення після зменшення */
    decrement() { return --count; },

    /** @returns {number} поточне значення */
    get()       { return count; },

    /** Скинути до початкового значення @returns {number} */
    reset()     { return (count = initial); },
  };
};

// ═══════════════════════════════════════════════════════════════
//  2. createLimitedCounter — з мінімумом та максимумом
// ═══════════════════════════════════════════════════════════════

/**
 * Лічильник з межами: не виходить за [min, max].
 * Валідація меж при створенні та кожному виклику.
 *
 * @param {number} min     — мінімальне значення
 * @param {number} max     — максимальне значення
 * @param {number} [initial=min] — початкове значення
 * @returns {{ increment: Function, decrement: Function, get: Function,
 *             reset: Function, isMin: Function, isMax: Function,
 *             getRange: Function }}
 *
 * @example
 * const c = createLimitedCounter(0, 3);
 * c.increment(); // → 1
 * c.increment(); // → 2
 * c.increment(); // → 3
 * c.increment(); // → 3  (не виходить за max)
 * c.isMax();     // → true
 */
const createLimitedCounter = (min, max, initial = min) => {
  // ── валідація при створенні ──────────────────────────────────
  if (typeof min !== 'number' || typeof max !== 'number')
    throw new TypeError('min та max мають бути числами');
  if (min > max)
    throw new RangeError(`min (${min}) не може бути більшим за max (${max})`);
  if (initial < min || initial > max)
    throw new RangeError(`initial (${initial}) виходить за межі [${min}, ${max}]`);

  // ── приватні змінні ──────────────────────────────────────────
  let count = initial;
  const clamp = v => Math.min(max, Math.max(min, v));
  // ────────────────────────────────────────────────────────────

  return {
    increment() { return (count = clamp(count + 1)); },
    decrement() { return (count = clamp(count - 1)); },
    get()       { return count; },
    reset()     { return (count = initial); },

    /** @returns {boolean} true якщо досягнуто мінімуму */
    isMin()     { return count === min; },

    /** @returns {boolean} true якщо досягнуто максимуму */
    isMax()     { return count === max; },

    /** @returns {{ min: number, max: number }} */
    getRange()  { return { min, max }; },
  };
};

// ═══════════════════════════════════════════════════════════════
//  3. createStepCounter — зі змінним кроком
// ═══════════════════════════════════════════════════════════════

/**
 * Лічильник із налаштовуваним кроком збільшення/зменшення.
 *
 * @param {number} [step=1]    — початковий крок (> 0)
 * @param {number} [initial=0] — початкове значення
 * @returns {{ increment: Function, decrement: Function, get: Function,
 *             reset: Function, setStep: Function, getStep: Function }}
 *
 * @example
 * const c = createStepCounter(5);
 * c.increment(); // → 5
 * c.increment(); // → 10
 * c.setStep(2);
 * c.increment(); // → 12
 * c.getStep();   // → 2
 */
const createStepCounter = (step = 1, initial = 0) => {
  if (typeof step !== 'number' || step <= 0)
    throw new RangeError(`step має бути числом > 0, отримано: ${step}`);

  // ── приватні змінні ──────────────────────────────────────────
  let count = initial;
  let _step = step;
  // ────────────────────────────────────────────────────────────

  return {
    increment()  { return (count += _step); },
    decrement()  { return (count -= _step); },
    get()        { return count; },
    reset()      { return (count = initial); },

    /**
     * Змінити крок
     * @param {number} newStep — новий крок (> 0)
     */
    setStep(newStep) {
      if (typeof newStep !== 'number' || newStep <= 0)
        throw new RangeError(`step має бути > 0`);
      _step = newStep;
    },

    /** @returns {number} поточний крок */
    getStep() { return _step; },
  };
};

// ═══════════════════════════════════════════════════════════════
//  4. createNamedCounter — з ім'ям та історією змін
// ═══════════════════════════════════════════════════════════════

/**
 * Лічильник з іменем та приватною історією всіх змін.
 * Історія повертається як незмінна копія — пряма модифікація неможлива.
 *
 * @param {string} name        — ім'я лічильника
 * @param {number} [initial=0] — початкове значення
 * @returns {{ increment: Function, decrement: Function, get: Function,
 *             reset: Function, getName: Function,
 *             getHistory: Function, clearHistory: Function }}
 *
 * @example
 * const c = createNamedCounter('score', 0);
 * c.increment();    // → 1
 * c.increment();    // → 2
 * c.decrement();    // → 1
 * c.getHistory();
 * // → [
 * //   { action: 'increment', from: 0, to: 1, timestamp: '...' },
 * //   { action: 'increment', from: 1, to: 2, timestamp: '...' },
 * //   { action: 'decrement', from: 2, to: 1, timestamp: '...' },
 * // ]
 */
const createNamedCounter = (name, initial = 0) => {
  if (typeof name !== 'string' || name.trim() === '')
    throw new TypeError('name має бути непорожнім рядком');

  // ── приватні змінні ──────────────────────────────────────────
  let count = initial;
  const history = []; // приватний масив — зовні недоступний

  const record = (action, from, to) => {
    history.push({
      action,
      from,
      to,
      timestamp: new Date().toISOString(),
    });
  };
  // ────────────────────────────────────────────────────────────

  return {
    increment() {
      const prev = count;
      count++;
      record('increment', prev, count);
      return count;
    },

    decrement() {
      const prev = count;
      count--;
      record('decrement', prev, count);
      return count;
    },

    get() { return count; },

    reset() {
      const prev = count;
      count = initial;
      record('reset', prev, count);
      return count;
    },

    /** @returns {string} ім'я лічильника */
    getName() { return name; },

    /**
     * Повертає копію історії — оригінал недоступний ззовні.
     * @returns {Array<{ action: string, from: number, to: number, timestamp: string }>}
     */
    getHistory() {
      return history.map(entry => ({ ...entry })); // захисна копія
    },

    /** Очистити історію */
    clearHistory() {
      history.length = 0;
    },

    /** @returns {number} кількість записів в історії */
    historySize() { return history.length; },
  };
};

export {
  createCounter,
  createLimitedCounter,
  createStepCounter,
  createNamedCounter,
};
