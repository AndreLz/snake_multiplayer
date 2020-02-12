<template>
  <div>
    <div v-if="game_on" class="game">
      <span v-for="x in list" :key="x" class="px">
        <span
          v-for="y in list"
          :key="y"
          class="px col"
          :class="{snake: isSnake(x,y), food: isFood(x,y)}"
        ></span>
      </span>
    </div>
    <p v-for="(x,i) in players" :key="i">score: {{ x.score }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      total: 25,
      snake: [],
      snakeLenth: 1,
      snakeDirection: "right",
      food: {},
      game_on: true,
      you: {},
      players: [
        { snake: [], snakeLenth: 1, snakeDirection: "right", score: 0 },
        { snake: [], snakeLenth: 1, snakeDirection: "right", score: 0 },
        { snake: [], snakeLenth: 1, snakeDirection: "right", score: 0 },
        { snake: [], snakeLenth: 1, snakeDirection: "right", score: 0 },
        { snake: [], snakeLenth: 1, snakeDirection: "right", score: 0 }
      ]
    };
  },
  created: function() {
    this.init();
  },
  destroyed: function() {
    window.removeEventListener("keyup", this.changeDirection);
  },
  computed: {
    list: function() {
      var x = [];
      for (var i = 0; i <= this.total; i++) x.push(i);
      return x;
    }
  },

  methods: {
    init() {
      this.newGame();
      window.addEventListener("keyup", this.changeDirection);

      setInterval(this.move, 100);
    },
    newGame() {
      this.players.forEach(player => {
        player.snakeLenth = 1;
        player.snake = [];
        player.snake.push(this.getRand());
      });

      this.food = this.getRand();
    },

    move() {
      this.players.forEach(player => {
        var last = player.snake[player.snake.length - 1];
        var x = last.x;
        var y = last.y;

        if (x == this.food.x && y == this.food.y) this.eat(player);

        switch (player.snakeDirection) {
          case "up":
            y -= 1;
            break;
          case "right":
            x += 1;
            break;
          case "down":
            y += 1;
            break;
          case "left":
            x -= 1;
            break;
        }

        if (y > this.total) y = 0;
        if (x > this.total) x = 0;
        if (y < 0) y = this.total;
        if (x < 0) x = this.total;

        // this bite
        player.snake.forEach(i => {
          if (i != undefined && i.x == x && i.y == y) this.newBegin(player);
        });

        player.snake.push({ x: x, y: y });

        if (player.snake.length > player.snakeLenth) player.snake.shift();
      });
    },
    newBegin(player) {
      player.snakeLenth = 1;
      player.snake = [];
      player.score = 0;
    },
    isSnake(x, y) {
      for (const i in this.players) {
        for (const j in this.players[i].snake) {
          if (
            this.players[i].snake[j].x == x &&
            this.players[i].snake[j].y == y
          )
            return true;
        }
      }
    },
    isFood(x, y) {
      if (this.food.x == x && this.food.y == y) {
        return true;
      }
    },
    eat(player) {
      player.snakeLenth += 1;
      this.food = this.getRand();
    },
    changeDirection(e) {
      e.preventDefault();
      e.stopPropagation();

      var directions = {
        37: "left",
        38: "up",
        39: "right",
        40: "down"
      };

      if (directions[e.keyCode] !== undefined) {
        if (
          (this.snakeDirection == "right" && directions[e.keyCode] == "left") ||
          (this.snakeDirection == "left" && directions[e.keyCode] == "right") ||
          (this.snakeDirection == "down" && directions[e.keyCode] == "up") ||
          (this.snakeDirection == "up" && directions[e.keyCode] == "down")
        ) {
          return false;
        }

        this.snakeDirection = directions[e.keyCode];
      }

      return false;
    },

    getRand() {
      return {
        x: Math.floor(Math.random() * this.total),
        y: Math.floor(Math.random() * this.total)
      };
    }
  }
};
</script>

<style>
body {
  background: #e1e1e1;
}

div#app {
  text-align: center;
  margin-top: 100px;
}

.game {
  height: 280px;
}

.px {
  width: 10px;
  height: 10px;
  background: #e5e5e5;
  border-bottom: 1px solid #fff;
  border-right: 1px solid #fff;
  display: inline-block;
}
.px.col {
  display: block;
}

.snake {
  background: #333;
}

.food {
  background: blue;
}
</style>
