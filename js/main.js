// Axolokl — page scripts
document.documentElement.classList.add('js');

// Start the hero load sequence once the photo is ready
const bike = document.querySelector('.hero__bike');
const start = () => requestAnimationFrame(() => document.documentElement.classList.add('is-loaded'));
if (bike && !bike.complete) bike.addEventListener('load', start, { once: true });
else start();
