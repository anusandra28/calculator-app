const expressionDisplay = document.getElementById("expression");
const resultDisplay = document.getElementById("result");
const keypad = document.querySelector(".keypad");

let expression = "";
let justCalculated = false;

const operators = ["+", "−", "×", "÷"];

function updateDisplay() {
  expressionDisplay.textContent = expression;
  resultDisplay.textContent = expression || "0";
}

function appendValue(value) {
  if (justCalculated && /[0-9.]/.test(value)) {
    expression = "";
  }
  justCalculated = false;

  if (operators.includes(value)) {
    if (!expression) {
      if (value === "−") expression = value;
      updateDisplay();
      return;
    }
    if (operators.includes(expression.slice(-1))) {
      expression = expression.slice(0, -1) + value;
    } else {
      expression += value;
    }
  } else if (value === ".") {
    const currentNumber = expression.split(/[+−×÷%]/).pop();
    if (currentNumber.includes(".")) return;
    expression += currentNumber === "" ? "0." : ".";
  } else if (value === "%") {
    if (/[0-9]$/.test(expression)) expression += "%";
  } else {
    expression += value;
  }

  updateDisplay();
}

function clearAll() {
  expression = "";
  justCalculated = false;
  expressionDisplay.textContent = "";
  resultDisplay.textContent = "0";
}

function deleteLast() {
  expression = expression.slice(0, -1);
  justCalculated = false;
  updateDisplay();
}

function calculate() {
  if (!expression) return;

  try {
    let normalized = expression
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-")
      .replace(/%/g, "/100");

    // Accept only calculator characters; never evaluate arbitrary JavaScript.
    if (!/^[0-9+*/.()\-\s]+$/.test(normalized)) {
      throw new Error("Invalid expression");
    }

    // Parse and calculate using a restricted arithmetic grammar.
    const tokens = normalized.match(/\d*\.?\d+|[()+\-*/]/g) || [];
    if (tokens.join("") !== normalized.replace(/\s/g, "")) {
      throw new Error("Invalid expression");
    }

    let position = 0;
    function parseExpression() {
      let value = parseTerm();
      while (tokens[position] === "+" || tokens[position] === "-") {
        const operator = tokens[position++];
        const right = parseTerm();
        value = operator === "+" ? value + right : value - right;
      }
      return value;
    }
    function parseTerm() {
      let value = parseFactor();
      while (tokens[position] === "*" || tokens[position] === "/") {
        const operator = tokens[position++];
        const right = parseFactor();
        if (operator === "/" && right === 0) throw new Error("Cannot divide by zero");
        value = operator === "*" ? value * right : value / right;
      }
      return value;
    }
    function parseFactor() {
      if (tokens[position] === "+" || tokens[position] === "-") {
        const sign = tokens[position++] === "-" ? -1 : 1;
        return sign * parseFactor();
      }
      if (tokens[position] === "(") {
        position++;
        const value = parseExpression();
        if (tokens[position++] !== ")") throw new Error("Invalid expression");
        return value;
      }
      const token = tokens[position++];
      if (!token || !/^\d*\.?\d+$/.test(token)) throw new Error("Incomplete expression");
      return Number(token);
    }

    if (!tokens.length) throw new Error("Invalid expression");
    const answer = parseExpression();
    if (position !== tokens.length || !Number.isFinite(answer)) {
      throw new Error("Invalid expression");
    }

    expressionDisplay.textContent = expression + " =";
    expression = String(Number(answer.toPrecision(12)));
    resultDisplay.textContent = expression;
    justCalculated = true;
  } catch (error) {
    resultDisplay.textContent = error.message === "Cannot divide by zero" ? "Cannot divide by 0" : "Error";
    justCalculated = false;
  }
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.action === "clear") clearAll();
  else if (button.dataset.action === "delete") deleteLast();
  else if (button.dataset.action === "equals") calculate();
  else if (button.dataset.value) appendValue(button.dataset.value);
});

document.addEventListener("keydown", (event) => {
  if (/^[0-9.]$/.test(event.key)) appendValue(event.key);
  else if (event.key === "+") appendValue("+");
  else if (event.key === "-") appendValue("−");
  else if (event.key === "*") appendValue("×");
  else if (event.key === "/") {
    event.preventDefault();
    appendValue("÷");
  } else if (event.key === "%") appendValue("%");
  else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    calculate();
  } else if (event.key === "Backspace") deleteLast();
  else if (event.key === "Escape") clearAll();
});
