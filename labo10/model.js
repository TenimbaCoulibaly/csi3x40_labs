var Params = (function () {
    var entity = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
      var pair = vars[i].split("=");
      // If first entry with this name
      if (typeof entity[pair[0]] === "undefined") {
        entity[pair[0]] = decodeURIComponent(pair[1]);

      // If second entry with this name
      } else if (typeof entity[pair[0]] === "string") {
        var arr = [ entity[pair[0]],decodeURIComponent(pair[1]) ];
        entity[pair[0]] = arr;

      // If third or later entry with this name
      } else {
        entity[pair[0]].push(decodeURIComponent(pair[1]));
      }
    } 
    return entity;
  }());

  var Scene = (function(){
    var entity = {};

    function fullScreenProperties() {
      var ratio = 0.8;
      return {
        x: window.innerWidth * ratio, 
        y: window.innerHeight * ratio
      };
    }

    function drawGrass() {
      entity.context.fillStyle = entity.styles.grass;
      entity.context.fillRect(0, entity.y*0.9, entity.x, entity.y*0.1);
    }

    function drawSky() {
      entity.context.fillStyle = entity.styles.sky;
      entity.context.fillRect(0, 0, entity.x, entity.y*0.9);
    }

    function drawTree(x) {
      var y = entity.y * 0.9;
      var context = entity.context;

      context.beginPath();
      context.moveTo(x, y);
      context.fillStyle = entity.styles.trunk;
      context.lineTo(x + entity.treeWidth * 1/3, y - 20);
      context.lineTo(x + entity.treeWidth * 2/3, y - 20);
      context.lineTo(x + entity.treeWidth, y);
      context.closePath();
      context.fill();

      context.beginPath();
      context.arc(x + entity.treeWidth / 2, y - 25, 10, 0, Math.PI*2);
      context.fillStyle = entity.styles.leaves;
      context.fill();
    }

    function checkCollisions() 
    {
      var playerMin, playerMax, treeMin, treeMax;
      playerMin = entity.player;
      playerMax = playerMin + entity.playerWidth;
      for (var i in entity.trees) {
        treeMin = entity.trees[i];
        treeMax = treeMin + entity.treeWidth;

        if (playerMax >= treeMin && playerMin <= treeMax) {
          if (entity.jumpPercent >= 75 || entity.jumpPercent <= 25) {
            blowUp();
          }
        }
      }
    }

    function blowUp()
    {
      drawPlayer("collision");
    }

    function drawPlayer(mode) 
    {
      var y = entity.y * 0.9;

      if (entity.playerJumping && !entity.jumpPercent) {
        entity.jumpPercent = 100;
      }

      switch (entity.playerDirection) {
        case "right":
          entity.player += 1;
          break;
        case "left":
          entity.player -= 1;
          break;
      }

      var jumpOffset;
      if (entity.jumpPercent) {
        switch (Math.ceil(entity.jumpPercent / 25)) {
          case 4:
          case 1:
          case 0:
            jumpOffset = 30;
            break;
          case 2:
          case 3:
            jumpOffset = 40;
            break;
        }

        entity.jumpPercent -= 1;
      } else {
        jumpOffset = 0;
      }

      entity.player = Math.max(0, entity.player);
      entity.player = Math.min(entity.x - entity.playerWidth, entity.player);

      entity.context.beginPath();
      entity.context.fillStyle = mode == "normal" ? "#f1c40f" : "#e74c3c";
      entity.context.fillRect(entity.player, y - 25 - jumpOffset, entity.playerWidth, 25);
      entity.context.fill();
    }

    function showDebug() 
    {
      entity.debug.style.width = entity.x + "px";
      if (entity.isDebug) {
        debug.style.display = 'block';
      }
    }

    entity.tick = function() {
      entity.drawpad.width = entity.drawpad.width;

      drawGrass();
      drawSky();
      entity.position += 1;

      for (var i in entity.trees) {
        entity.trees[i] -= 1;
        var treeOffset = entity.trees[i];
        if (treeOffset >= 0 && treeOffset <= entity.x) {
          drawTree(treeOffset);
        }
      }
      drawPlayer("normal");
      checkCollisions();
    }

    function keydown(event) {
      switch (event.keyCode) {
        case 39:
          entity.playerDirection = "right";
          break;
        case 37:
          entity.playerDirection = "left";
          break;
        case 38:
          entity.playerJumping = true;
          break;
        default:
          entity.playerDirection = null;
          break;
      }
    }

    function keyup(event) {
      switch (event.keyCode) {
        case 39:
        case 37:
          entity.playerDirection = null;
          break;
        case 38:
          entity.playerJumping = false;
          break;
      }
    }

    entity.reset = function() {
      entity.styles = {
          grass: "#2ecc71",
          sky: "#3498db",
          trunk: "#A17917",
          leaves: "#27ae60"
      };

      entity.timer = null;
      entity.player = 10;
      entity.playerDirection = null;
      entity.playerJumping = false;
      entity.playerWidth = 15;
      entity.treeWidth = 12;
      entity.jumpPercent = 0;
      entity.position = -1;
      entity.trees = [100, 500, 800, 1000, 1200];
      entity.tick();
      
    }
    //Score et santé
    entity.init = function(drawpad) {
        var dim = fullScreenProperties();
        this.drawpad = drawpad;
        this.context = drawpad.getContext("2d");
        this.x = dim.x;
        this.y = dim.y;
        this.drawpad.width = dim.x;
        this.drawpad.height = dim.y;
        this.isDebug = Params.debug == 1;
      
        // Ajouter un score et une santé pour le joueur
        this.score = 0;
        this.health = 100;
      }

    entity.tick = function() {
        // Vérifie si le joueur a atteint la fin
        if (this.player.position >= this.endPosition) {
            this.stop();
        }
    }

    entity.stop = function() {
        // Arrête le jeu et effectue les actions nécessaires
        clearInterval(this.timer);
        this.timer = null;
        this.saveHighScore();
        this.displayGameOver();
    }

    entity.saveHighScore = function() {
        // Sauvegarde le high score dans le localStorage
        localStorage.setItem('highScore', this.highScore);
    }

    entity.displayGameOver = function() {
        // Affiche l'écran de fin de jeu
        console.log('Game Over');
    }
 

      
      // Ajouter un "high score"
entity.highScore = localStorage.getItem('highScore') || 0;

// Créer d'autres obstacles
entity.obstacles = [
  {type: 'tree', position: 100},
  {type: 'bird', position: 500},
  {type: 'animal', position: 800}
];

// Ajouter des objets de collection
entity.collectibles = [
  {type: 'coin', position: 200},
  {type: 'fruit', position: 700},
  {type: 'gold', position: 900}
];
// Ajouter d'autres éléments au paysage
entity.landscapeElements = [
    {type: 'mountain', position: 300},
    {type: 'river', position: 600}
  ];
  
  // Plusieurs formes pour les arbres
  entity.trees = [
    {type: 'pine', position: 100},
    {type: 'oak', position: 500},
    {type: 'birch', position: 800}
  ];
  
  // Les nuages
  entity.clouds = [
    {position: 200},
    {position: 700},
    {position: 900}
  ];
  
  // Des gradients dans le ciel ou l'herbe
  entity.draw = function() {
    var gradient = this.context.createLinearGradient(0, 0, 0, this.y);
    gradient.addColorStop(0, 'skyblue');
    gradient.addColorStop(1, 'green');
    this.context.fillStyle = gradient;
    this.context.fillRect(0, 0, this.x, this.y);
  }

    entity.start = function() {
      entity.timer = setInterval(entity.tick, 10);        
    }

    entity.stop = function() {
      clearInterval(entity.timer);
    }

    entity.init = function(drawpad) {
      var dim = fullScreenProperties();
      this.drawpad = drawpad;
      this.context = drawpad.getContext("2d");
      this.x = dim.x;
      this.y = dim.y;
      this.drawpad.width = dim.x;
      this.drawpad.height = dim.y;
      this.isDebug = Params.debug == 1;
      this.debug = document.getElementById("debug");

      this.reset();
      showDebug();

      if (!this.isDebug) {
        this.start();
      }
    }
});