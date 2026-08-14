/* particles-config.js – Space‑Pixel particles */
particlesJS("particles-js", {
  "particles": {
    "number": { "value": 120 },
    "color": { "value": ["#ffffff", "#00a8cc", "#e6005c"] },
    "shape": {
      "type": ["circle","image"],
      "image": [{"src": "assets/planet.svg","width": 40,"height": 40}]
    },
    "opacity": { "value": 0.7 },
    "size": { "value": 2, "random": true },
    "line_linked": { "enable": false },
    "move": { "enable": true, "speed": 0.4, "direction": "none", "random": true, "straight": false, "out_mode": "out", "bounce": false, "attract": { "enable": true, "rotateX": 600, "rotateY": 1200 } }
  },
  "interactivity": { "detect_on": "canvas", "events": { "onhover": { "enable": true, "mode": "repulse" }, "onclick": { "enable": true, "mode": "push" }, "resize": true }, "modes": { "repulse": { "distance": 80, "duration": 0.4 }, "push": { "particles_nb": 4 } } },
  "retina_detect": true
});
