// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const sqlmanager = require("./sqlmanager.js");
const Discord = require("discord.js");
const config = require("./config.json");



const client = new Discord.Client();

const prefix = "!";
var workers = new Map();
var esJefe = false;
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", function(message) {
  
  let rolJefe = message.guild.roles.cache.get("781520694990733362");
  
  if(message.member.roles.cache.has(rolJefe.id)){
    esJefe = true;
  }
  else{
    esJefe = false;
  }
  
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  //message.delete();
  const commandBody = message.content.slice(prefix.length);
  const args = commandBody.split(" ");
  const command = args.shift().toLowerCase();
  switch (command) {
    case "entrada":
      entrada(message);
      break;
    case "salida":
      salida(message);
      break;
    case "registrar":
      break;
    case "horas":
      horas(message, args[0]);
      break;
    case "limpiarhoras":
      limpiarHoras(message,args[0]);
    break;
    case "limpiarhorastodas":
      limpiarHorasTotales(message);
    break;
    //case "clear":
      //clear(message);
    //break;
    case "test":
      //test(message,args);
      test2();
      break;
    default:
      message.reply("No te he entendido");
  }
});

function clear(message){
  if (message.member.hasPermission("MANAGE_MESSAGES")) {
           var chanel = message.channel;
           chanel.bulkDelete(100).then(messages => {});                
        }
}

function limpiarHorasTotales(message){
   if (esJefe){
      sqlmanager.limpiarHorasTotales();
      message.reply("Se han eliminado todas las horas de todos los trabajadores");
   }
   else{
     message.reply("No tienes permisos para realizar este comando");
   }
 
}
function getUserFromMention(mention) {
  if (!mention) return;

  if (mention.startsWith("<@") && mention.endsWith(">")) {
    mention = mention.slice(2, -1);

    if (mention.startsWith("!")) {
      mention = mention.slice(1);
    }

    return client.users.cache.get(mention);
  }
}
function test2() {
  sqlmanager.cargarTiempoUser("kekotalaverano");
}
function horas(message, mention) {
  var user = getUserFromMention(mention);
  if (user === undefined) {
    message.reply("No has indicado un usuario");
  } else {
    var tiempo = 0;
   sqlmanager.cargarTiempoUser(user.username).then(tiempo =>{
   console.log("tiempo en server.js " + tiempo);
    var time = secondsToTime(tiempo/1000);
    message.reply(
      `El usuario consultado lleva un total trabajado de: ${time.h} horas, ${time.m} minutos, ${time.s} segundos`
      );
   });                                         
    
  }
}
function limpiarHoras (message,mention){
  var user = getUserFromMention(mention);
  if (user === undefined) {
    message.reply("No has indicado un usuario");
  }
  else{
  if (esJefe){
      sqlmanager.limpiarHoras(user.username);
      message.reply("Horas del usuario introducido borradas");
   }
   else{
     message.reply("No tienes permisos para realizar este comando");
   }



    
  }
}
function test(message, args) {
  let mensaje = "Los tipos de los argumentos son: ";
  /*for(var argun in args){
    mensaje = mensaje + Object.prototype.toString.call(argun);
  }*/
  var user = client.users.fetch(args[0]);
  message.reply(mensaje + Object.prototype.toString.call(user));
}
function entrada(message) {
  const fecha = Date.now();
  if (workers.get(message.author) === undefined) {
    workers.set(message.author, fecha);
    message.reply(`Has fichado correctamente`);
  } else {
    message.reply("Ya te encuentras en el sistema");
  }
}
function salida(message) {
  if (workers.get(message.author) !== undefined) {
    var fechaIni = workers.get(message.author);
    var totalTime = Date.now() - fechaIni;
    var time = secondsToTime(totalTime / 1000);
    workers.delete(message.author);
    message.reply(
      `Total trabajado ${time.h} horas, ${time.m} minutos, ${time.s} segundos`
    );
    sqlmanager.guardarTiempoUser(message.author.username, totalTime);
  } else {
    message.reply("No te encuentras en el sistema");
  }
}
function secondsToTime(secs) {
  secs = Math.round(secs);
  var hours = Math.floor(secs / (60 * 60));

  var divisor_for_minutes = secs % (60 * 60);
  var minutes = Math.floor(divisor_for_minutes / 60);

  var divisor_for_seconds = divisor_for_minutes % 60;
  var seconds = Math.ceil(divisor_for_seconds);

  var obj = {
    h: hours,
    m: minutes,
    s: seconds
  };
  return obj;
}
client.login(process.env.BOT_TOKEN);

// our default array of dreams
const dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

// send the default array of dreams to the webpage
app.get("/dreams", (request, response) => {
  // express helps us take JS objects and send them as JSON
  response.json(dreams);
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
