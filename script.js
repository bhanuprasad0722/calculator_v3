const output = document.getElementById('output');
const buttons = document.querySelectorAll('button');
let currentValue = '';
let operator = '';
let errorOccurred = false;  // New flag to check for errors

// Define a constant for the maximum allowed value
const MAX_VALUE = 9.99999999e99; // Equivalent to 9.99999999 x 10^99

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('contextmenu', (e) => e.preventDefault()); // Disable right-click
  document.addEventListener('copy', (e) => e.preventDefault()); // Disable copying
  document.addEventListener('paste', (e) => e.preventDefault()); // Disable pasting
  currentValue = localStorage.getItem('calculatorValue') || '';
  output.value = currentValue;
});

buttons.forEach(button => {
  button.addEventListener('click', () => {
    
    // Clear error on next button press
    if (errorOccurred) {
      currentValue = '';
      errorOccurred = false;
    }

    if (button.id === 'clear') {
      currentValue = '';
    } else if (button.id === 'delete') {
      currentValue = currentValue.toString().slice(0, -1);  // Ensure currentValue is a string
    } else if (button.id === 'equals') {
      try {
        currentValue = currentValue.toString().trim();  // Ensure currentValue is a string
        
        // Replace 'x' with '*' for the evaluation
        const expression = currentValue.replace(/x/g, '*');
        
        // Check for Zero Division Error
        if (/\/0/.test(expression)) {
          throw new Error("Division by zero");
        }
  
        // Check for multiple consecutive operators
        if (/[\+\-\*\/]{2,}/.test(expression)) {
          throw new Error("Multiple consecutive operators");
        }

        // Evaluate the expression
        const result = evaluateExpression(expression);
        
        // Check if the result exceeds the maximum allowed value
        if (result > MAX_VALUE) {
          throw new Error("Overflow: Value exceeds maximum limit");
        }
        
        currentValue = result;

      } catch (error) {
        currentValue = 'Error';
        errorOccurred = true;  // Set error flag
      }
    } else {
      const lastChar = currentValue.toString().slice(-1);  // Ensure currentValue is a string
      const operators = ['+', '-', 'x', '/'];
      
      // Prevent multiple consecutive operators
      if (operators.includes(button.innerText) && operators.includes(lastChar)) {
        return;  // Ignore if multiple operators pressed consecutively
      }
  
      currentValue += button.innerText;
    }
  
    // Limit display to 12 characters
    if (currentValue.length > 12) {
      currentValue = 'Limit Exceeded';
      errorOccurred = true;
    }
  
    output.value = currentValue;
    localStorage.setItem('calculatorValue', currentValue); // Persist data
  });
});

// Helper function to evaluate the mathematical expression using the shunting yard algorithm
function evaluateExpression(expression) {
  const precedence = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2
  };

  const operators = [];
  const values = [];
  
  let num = '';
  for (let i = 0; i < expression.length; i++) {
    const char = expression[i];
    
    if (/\d|\./.test(char)) {
      // If it's a digit or a decimal point, keep building the number
      num += char;
    } else if (char in precedence) {
      // If it's an operator, push the built number into the values stack
      if (num) {
        values.push(parseFloat(num));
        num = '';
      }
      
      while (operators.length && precedence[char] <= precedence[operators[operators.length - 1]]) {
        const operator = operators.pop();
        const b = values.pop();
        const a = values.pop();
        values.push(applyOperator(a, b, operator));
      }
      operators.push(char);
    }
  }
  
  if (num) {
    values.push(parseFloat(num));
  }
  
  while (operators.length) {
    const operator = operators.pop();
    const b = values.pop();
    const a = values.pop();
    values.push(applyOperator(a, b, operator));
  }
  
  return values[0];
}

// Helper function to apply an operator to two numbers
function applyOperator(a, b, operator) {
  switch (operator) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      if (b === 0) {
        throw new Error('Division by zero');
      }
      return a / b;
    default:
      return 0;
  }
}
