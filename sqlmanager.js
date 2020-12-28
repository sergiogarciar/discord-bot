const sqlite3 = require("sqlite3").verbose();

// open the database
let db = new sqlite3.Database(
  "./db/fichajes.db",
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  err => {
    if (err) {
      console.error(err.message);
    }
    console.log("Connected to the fichajes database.");
  }
);
//TODO mover los datos al modelo nuevo, cambiar consultas al modelo nuevo
db.serialize(() => {
  // queries will execute in serialized mode
  db.serialize(() => {
    // queries will execute in serialized mode
    db.run("CREATE TABLE IF NOT EXISTS FICHAJE(user text, totalHoras NUMBER)");
    db.run("CREATE TABLE IF NOT EXISTS FICHAJEv2(id INTEGER PRIMARY KEY AUTOINCREMENT,user text, entrada NUMBER,salida NUMBER,mes NUMBER,anio NUMBER,semana NUMBER)");
  });
  // queries will execute in serialized mode
});
const getUserTime = usuario => {
  return new Promise((resolve, reject) => {
    var totalHoras = -1;

    var db = openDatabase();

    // queries will execute in serialized mode
    db.serialize(() => {
      // queries will execute in serialized mode

      db.get(
        `SELECT totalHoras total from fichaje where user = ?`,
        [usuario],
        (err, row) => {
          if (err) {
            console.error(err.message);
            reject(err);
            return;
          }
          console.log("SELECT totalHoras from fichaje where user = " + usuario);

          if (row !== undefined) {
            console.log("row totalhoras " + row.total);
            totalHoras = row.total;
          } else {
            totalHoras = -1;
          }
          resolve(totalHoras);
        }
      );
    });

    closeDatabase(db);
  });
};
function limpiarHoras(usuario) {

  var db = openDatabase();
  db.run(`delete from fichaje where user = ?`, usuario);
  closeDatabase(db);



}

function limpiarHorasTotales() {

  var db = openDatabase();
  db.run(`delete from fichaje`);
  closeDatabase(db);



}

function updateTime(user, time) {
  var userTime = -1;
  getUserTime(user).then(userTime => {
    console.log("user time antes de update " + userTime);

    var db = openDatabase();
    if (userTime == -1) {
      db.serialize(() => {
        db.run(
          `INSERT INTO fichaje (user,totalHoras) values (?,?)`,
          [user, time],
          function(err) {
            if (err) {
              return console.error(err.message);
            }
            console.log("INSERT realizado con valores: " + user + ", " + time);
          }
        );
      });
    } else {

      db.serialize(() => {
        var timeTotal = time + userTime;
        db.run(
          `UPDATE fichaje SET totalHoras = ? where user = ?`,
          [timeTotal, user],
          function(err) {
            if (err) {
              return console.error(err.message);
            }
            console.log(
              "UPDATE realizado con valores: " + user + ", " + timeTotal
            );
          }
        );
      });
    }
    closeDatabase(db);
  });
}

db.close(err => {
  if (err) {
    console.error(err.message);
  }
  console.log("Close the database connection.");
});

// FUNCIONES DE BASE DE DATOS
function openDatabase() {
  let db = new sqlite3.Database(
    "./db/fichajes.db",
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    err => {
      if (err) {
        console.error(err.message);
      }
      console.log("Connected to the fichajes database.");
    }
  );
  return db;
}
function closeDatabase(db) {
  db.close(err => {
    if (err) {
      console.error(err.message);
    }
    console.log("Close the database connection.");
  });
}
function entrada(user,fecha){
  let db = openDatabase();
  db.serialize(() => {
        db.run(
          `INSERT INTO fichajev2 (user,entrada) values (?,?)`,
          [user, fecha],
          function(err) {
            if (err) {
              return console.error(err.message);
            }
            console.log("INSERT realizado con valores: " + user + ", " + time);
          }
        );
      });
  closeDatabase(db);
}

function salida(user,fecha){
  let db = openDatabase();
  db.serialize(() => {
        
        db.run(
          `UPDATE fichaje SET salida = ? where user = ? and salida is null`,
          [fecha, user],
          function(err) {
            if (err) {
              return console.error(err.message);
            }
            console.log(
              "UPDATE realizado con valores: " + user + ", " + fecha
            );
          }
        );
      });
  closeDatabase(db);
}
module.exports = {
  cargarTiempoUser: function(usuario) {
    return getUserTime(usuario);
  },
  guardarTiempoUser: function(user, time) {
    console.log("Dentro de sqlmanager: " + time);
    updateTime(user, time);
  },
  limpiarHoras: function(usuario) {
    limpiarHoras(usuario);
  },
  limpiarHorasTotales: function() {
    limpiarHorasTotales();
  },
  entrada:function (user,fecha){
    entrada(user,fecha);
  },
  salida :function(user,fecha){
    salida(user,fecha);
  }

};
