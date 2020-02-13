<template>
  <v-container>
    <v-alert v-model="erro" type="error">Limite de jogadores atingido</v-alert>
    <v-row align="center" justify="center">
      <div v-if="players.lenght != 0" class="game" align="center">
        <span v-for="x in list" :key="x" class="pxl">
          <span
            v-for="y in list"
            :key="y"
            class="pxl col"
            :class="{snake: isSnake(x,y), food: isFood(x,y)}"
            :style="isYou(x,y)?color:''"
          ></span>
        </span>
      </div>

      <div class="panel panel-default ml-4" v-if="!erro">
        <div class="panel-heading">
          <h3 class="panel-title">Jogador</h3>
        </div>
        <div class="panel-body">
          <form id="form" class="form-inline">
            <v-row align="center" justify="center">
              <v-col>
                <div class="form-group">
                  Nome:
                  <input type="text" id="User" class="form-control" v-model="you.name" />
                </div>
              </v-col>
              <v-col>
                Escolha sua cor
                <v-color-picker
                  v-model="colorPicker"
                  hide-inputs
                  :swatches="swatches"
                  show-swatches
                ></v-color-picker>
              </v-col>
            </v-row>
          </form>
        </div>
      </div>
    </v-row>
    <div class="panel panel-default mt-4">
      <div class="panel-heading">
        <h3 class="panel-title">Jogadores</h3>
      </div>
      <div class="panel-body">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Jogador</th>
              <th>Pontos</th>

              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user,i) in players" :key="i">
              <td>{{user.name}}</td>
              <td>{{user.score}}</td>
              <td>
                <span
                  class="glyphicon glyphicon-trash"
                  aria-hidden="true"
                  v-on:click="removeUser(i)"
                ></span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </v-container>
</template>

<script>
import { db } from "./../db";
let usersRef = db.ref("partida").child("users");
let foodRef = db.ref("partida").child("food");

export default {
  name: "GameSample",
  firebase: {
    players: usersRef,
    food: foodRef
  },
  data() {
    return {
      total: 10,
      food: null,

      colorPicker: null,
      swatches: [
        ["#FF0000", "#AA0000", "#550000"],
        ["#FFFF00", "#AAAA00", "#555500"],
        ["#00FF00", "#00AA00", "#005500"],
        ["#00FFFF", "#00AAAA", "#005555"]
      ],

      you: {
        name: "New Player",
        snakeLenth: 1,
        snake: [],
        score: 0,
        snakeDirection: "right"
      },
      playerId: null,
      playerRef: null,
      players: [],
      erro: false
    };
  },
  created: async function() {
    //window.addEventListener("beforeunload", this.handler);
    var playersNow = await usersRef.once("value");
    const now = playersNow.numChildren();
    console.log(now);
    if (now < 5) {
      this.addUser();
      this.getFood();
      this.init();
    } else {
      this.erro = true;
    }
  },
  destroyed: function() {
    window.removeEventListener("keyup", this.changeDirection);
    //window.removeEventListener("beforeunload", this.exitHandler);
  },
  computed: {
    list: function() {
      var x = [];
      for (var i = 0; i <= this.total; i++) x.push(i);
      return x;
    },
    color() {
      if (this.colorPicker != null) return { background: this.colorPicker.hex };
      return { background: "#333" };
    }
  },

  methods: {
    //============================================== Firebase Functions =====================================================================
    updateUser: function() {
      usersRef.child(this.playerId).set(this.you);
    },
    limite5: function() {
      return this.players.length > 5;
    },

    addUser: function() {
      this.you.snake.push(this.getRand());
      usersRef.push(this.you).then(result => {
        this.playerId = result.key;
        usersRef
          .child(this.playerId)
          .onDisconnect()
          .remove();
      });
    },
    getFood: async function() {
      var aux = await foodRef.once("value");
      if (!aux.val()) foodRef.set(this.getRand());
    },
    updateFood: function() {
      var newPos = this.getRand();
      while (this.isSnake(newPos.x, newPos.y)) newPos = this.getRand();
      foodRef.set(this.getRand());
    },
    handler: function handler() {
      usersRef.child(this.playerId).remove();
    },

    updateSnakePos: function() {
      if (this.playerId != null) usersRef.child(this.playerId).set(this.you);
    },

    removeUser: function(i) {
      console.log(this.players[i][".key"]);
      usersRef.child(this.players[i][".key"]).remove();
    },
    //============================================== Game Functions =====================================================================
    init() {
      window.addEventListener("keyup", this.changeDirection);
      setInterval(this.move, 200);
    },

    move() {
      var player = this.you;
      var last = player.snake[player.snake.length - 1];
      var x = last.x;
      var y = last.y;

      if (x == this.food.x && y == this.food.y) this.eat();

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
        if (i != undefined && i.x == x && i.y == y) {
          this.newBegin(player);
          var newPos = this.getRand();
          x = newPos.x;
          y = newPos.y;
        }
      });

      player.snake.push({ x: x, y: y });

      if (player.snake.length > player.snakeLenth) player.snake.shift();
      this.updateUser();
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
    isYou(x, y) {
      for (const i in this.you.snake) {
        if (this.you.snake[i].x == x && this.you.snake[i].y == y) return true;
      }
    },
    isFood(x, y) {
      if (this.food.x == x && this.food.y == y) {
        return true;
      }
    },
    eat() {
      this.you.snakeLenth += 1;
      this.you.score += 1;
      this.updateFood();
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
          (this.you.snakeDirection == "right" &&
            directions[e.keyCode] == "left") ||
          (this.you.snakeDirection == "left" &&
            directions[e.keyCode] == "right") ||
          (this.you.snakeDirection == "down" &&
            directions[e.keyCode] == "up") ||
          (this.you.snakeDirection == "up" && directions[e.keyCode] == "down")
        ) {
          return false;
        }

        this.you.snakeDirection = directions[e.keyCode];
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

<style scoped>
body {
  background: #e1e1e1;
}

div#app {
  text-align: center;
  margin-top: 100px;
}

.col {
  padding: 10px;
}

.pxl {
  background: #e5e5e5;
  border-bottom: 1px solid #fff;
  border-right: 1px solid #fff;
  display: inline-block;
}
.pxl.col {
  display: block;
}

.snake {
  background: #333;
}

.food {
  background: blue;
}
</style>
