const serverURL = 'http://192.168.1.132:9000';

// Get the three switches
const redLEDButton = document.querySelector('#switch-led-red');
const yellowLEDButton = document.querySelector('#switch-led-yellow');
const greenLEDButton = document.querySelector('#switch-led-green');

// Whenever one of the LEDs gets enabled, we need to submit the new information to the server
// and disable the remaining buttons
redLEDButton.addEventListener('click', () => turnOn('red'));
yellowLEDButton.addEventListener('click', () => turnOn('yellow'));
greenLEDButton.addEventListener('click', () => turnOn('green'));

const turnOn = async (color) => {
  console.log(`Toggling ${color}`);
  const data = JSON.stringify({led: color});
  try {
    await fetch(serverURL, {
      method: 'POST',
      body: data,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.log(error);
  }
};
