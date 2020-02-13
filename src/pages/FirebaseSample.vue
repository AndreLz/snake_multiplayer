<template>
  <div id="app" class="container">
    <div class="panel panel-default">
      <div class="panel-heading">
        <h3 class="panel-title">Novo jogador</h3>
      </div>
      <div class="panel-body">
        <form id="form" class="form-inline" v-on:submit.prevent="changeName">
          <div class="form-group">
            <label for="User">Nome:</label>
            <input type="text" id="User" class="form-control" v-model="newUser.nome" />
          </div>
          <input type="submit" class="btn btn-primary" value="Alterar nome" />
        </form>
      </div>
    </div>
    <div class="panel panel-default">
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user,i) in users" :key="i">
              <td>{{user.nome}}</td>
              <td>{{user.pontos}}</td>
              <td>
                <span
                  class="glyphicon glyphicon-trash"
                  aria-hidden="true"
                  v-on:click="removeUser(i)"
                ></span>
              </td>
              <td>
                <span
                  class="glyphicon glyphicon-plus"
                  aria-hidden="true"
                  v-on:click="addPontos(user,i)"
                ></span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script>
import { db } from "./../db";

let usersRef = db.ref("partida");

export default {
  name: "app",
  firebase: {
    users: usersRef
  },

  data() {
    return {
      users: {},
      playerId: null,
      newUser: {
        nome: "New Player",
        pontos: 0
      }
    };
  },
  created() {
    //this.addUser();
    window.addEventListener("beforeunload", this.handler);
  },

  methods: {
    handler: function handler() {
      usersRef.child(this.playerId).remove();
    },
    changeName: function() {
      usersRef
        .child(this.playerId)
        .child("nome")
        .set(this.newUser.nome);
    },
    addUser: function() {
      usersRef.push(this.newUser).then(result => (this.playerId = result.key));
      this.newUser.nome = "";
    },
    addPontos: function(user, userKey) {
      usersRef
        .child(userKey)
        .child("pontos")
        .set(user.pontos + 1);
    },
    removeUser: userKey => {
      usersRef.child(userKey).remove();
      console.log("tirou");
    }
  }
};
</script>
<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 20px;
}
</style>