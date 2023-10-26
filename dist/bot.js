"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const config = __importStar(require("./config/config.json"));
const fs_1 = require("fs");
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
const Global_1 = require("./utils/Global");
const markup_1 = require("telegraf/typings/markup");
// Utiliza las constantes en tu código
const telegramToken = config.BOT_TOKEN;
// Importa el módulo 'config'
const bot = new telegraf_1.Telegraf(telegramToken); // Reemplaza 'TU_TOKEN_AQUI' con tu token de Telegram
// Maneja mensajes de texto
bot.on('text', (ctx) => {
    // Crear un teclado personalizado con opciones
    const keyboard = telegraf_1.Markup.inlineKeyboard([
        [telegraf_1.Markup.button.callback('CONOCER INFORMACIÓN DEL PARTIDO ⏰', 'infoGame')],
        [telegraf_1.Markup.button.callback('VER LISTA DE CUPOS DEL PARTIDO 📄', 'seeListQuotas')],
        [telegraf_1.Markup.button.callback('RESERVAR MI CUPO PARA EL COTEJO ✍🏽', 'reserveSpot')]
    ]);
    // Enviar un mensaje con el teclado
    ctx.reply(Global_1.Global.MSG_WELCOME, keyboard);
});
// Manejar las acciones de los botones
bot.action('infoGame', (ctx) => {
    (0, markup_1.removeKeyboard)();
    //Leemos la información del partido
    readFile(Global_1.Global.FILEPATH_INFOMATCH)
        .then((response) => {
        let message = "";
        const infoMatchData = response;
        if (infoMatchData.available) { // Si existe partido disponible
            // Formateamos la fecha para presentarla adecuadamente
            const dateMatch = infoMatchData.fullDate;
            const fecha = (0, date_fns_1.parse)(dateMatch, "dd/MM/yyyy HH:mm", new Date());
            // Mensaje de respuesta con información del partido
            message = Global_1.Global.BASE_MATCH_INFO
                .replace('{{ubication}}', infoMatchData.ubication)
                .replace('{{soccerField}}', infoMatchData.soccerField)
                .replace('{{fullDate}}', (0, date_fns_1.format)(fecha, "EEEE, d 'de' MMMM 'de' yyyy 'a las' h:mm a", { locale: locale_1.es }))
                .replace('{{price}}', infoMatchData.price);
        }
        else { // Si no existe partido disponible
            message = Global_1.Global.MSG_NO_MATCH_PROGRAMMING;
        }
        ctx.replyWithMarkdownV2(message);
    })
        .catch((error) => {
        ctx.reply(Global_1.Global.MSG_CATCH_ERROR);
        return;
    });
}); // end infoGame
bot.action('seeListQuotas', (ctx) => {
    var _a;
    printListQuotas(Number((_a = ctx.update.callback_query.message) === null || _a === void 0 ? void 0 : _a.chat.id))
        .then((response) => {
        ctx.replyWithMarkdownV2(response);
    });
}); // end seeListQuotas
bot.action('reserveSpot', (ctx) => {
    const options = telegraf_1.Markup.inlineKeyboard([
        [telegraf_1.Markup.button.callback('PORTERO', 'typePlayerGoalkeeper'), telegraf_1.Markup.button.callback('DEFENSA', 'typePlayerDefence')],
        [telegraf_1.Markup.button.callback('MEDIOCAMPISTA', 'typePlayerMidfielder'), telegraf_1.Markup.button.callback('DELANTERO', 'typePlayerForward')]
    ]);
    // Enviar un mensaje con el teclado
    ctx.reply('¿DE QUÉ JUGÁS? 🤔', options);
}); // end reserveSpot
bot.action(/typePlayer.*/, (ctx) => {
    const selectedOption = ctx.match[0];
    const typePlayer = selectedOption != Global_1.Global.TYPE_GOALKEEPER ? 'goalkeeper' : 'players';
    // Información del usuario actual
    const messageData = ctx.update.callback_query.message;
    // Leemos el archivo
    readFile(Global_1.Global.FILEPATH_MATCHQUOTAS)
        .then((response) => {
        // Información las cuotas del partido
        const infoMatchQuotas = response;
        // Buscamos si ya existe una reserva por el usuario
        const haveReservation = findReservationByChatId(infoMatchQuotas, messageData.chat.id);
        // Control para que no se pueda reservar si ya tiene una reserva activa
        if (haveReservation) {
            ctx.replyWithMarkdownV2(Global_1.Global.MSG_RESERVE_FAIL);
            return;
        }
        // Control para determinar si la reserva se realiza en la titular o suplencia
        const reservationAvailable = selectedOption === Global_1.Global.TYPE_GOALKEEPER
            ? infoMatchQuotas.goalkeepers.length < 2
            : infoMatchQuotas.players.length < 16;
        // Información del usuario para la reserva ya bien sea en la titular o suplencia
        const infoReservation = {
            dateTimeReservation: (0, date_fns_1.format)(new Date(), "dd/MM/yyyy HH:mm:ss"),
            fullName: `${messageData === null || messageData === void 0 ? void 0 : messageData.chat.first_name} ${messageData === null || messageData === void 0 ? void 0 : messageData.chat.last_name}`.replace(/[^\w\sáéíóúÁÉÍÓÚ]/gi, ''),
            pay: false,
            postion: selectedOption.replace('typePlayer', '').toLowerCase(),
            chatId: messageData.chat.id
        };
        // Almacenamos la reserva en la titular o la suplencia
        if (reservationAvailable) {
            const targetArray = selectedOption === Global_1.Global.TYPE_GOALKEEPER
                ? infoMatchQuotas.goalkeepers
                : infoMatchQuotas.players;
            targetArray.push(infoReservation);
        }
        else {
            infoMatchQuotas.substitutes.push(infoReservation);
        }
        // Guarda los datos en el archivo JSON
        fs_1.promises.writeFile(Global_1.Global.FILEPATH_MATCHQUOTAS, JSON.stringify(infoMatchQuotas, null, 2))
            .then(() => {
            // Mensaje de confirmación de reserva para el usuario
            ctx.replyWithMarkdownV2(Global_1.Global.MSG_RESERVE_SUCCESS);
            //Detener el Bot
            bot.stop();
            return;
        })
            .catch((error) => {
            ctx.reply(Global_1.Global.MSG_CATCH_ERROR);
            return;
        });
    })
        .catch((error) => {
        ctx.reply(Global_1.Global.MSG_CATCH_ERROR);
        return;
    });
}); // end reserveSpot
function readFile(filePath) {
    return fs_1.promises.readFile(filePath, 'utf8')
        .then((data) => JSON.parse(data));
} // end readFile
function findReservationByChatId(infoMatchQuotas, chatId) {
    //Buscar si existe alguna reserva
    return infoMatchQuotas.goalkeepers.find((player) => Number(player.chatId) === chatId) ||
        infoMatchQuotas.players.find((player) => Number(player.chatId) === chatId) ||
        infoMatchQuotas.substitutes.find((player) => Number(player.chatId) === chatId);
} // end findReservationByChatId
function printListQuotas(chatId) {
    return readFile(Global_1.Global.FILEPATH_MATCHQUOTAS)
        .then((response) => {
        const infoMatchQuotas = response;
        let bodyGoalkeeper = formattedRowPlayer(infoMatchQuotas.goalkeepers, chatId);
        let bodyPlayers = formattedRowPlayer(infoMatchQuotas.players, chatId);
        let bodySubstitutes = formattedRowPlayer(infoMatchQuotas.substitutes, chatId);
        return Global_1.Global.BASE_ALL_LIST_PLAYERS
            .replace('{{bodyGoalkeeper}}', bodyGoalkeeper)
            .replace('{{bodyPlayers}}', bodyPlayers)
            .replace('{{bodySubstitutes}}', bodySubstitutes);
    });
} // end printListQuotas
function formattedRowPlayer(playersInfo, chatId) {
    let listPlayers = playersInfo.length === 0 ? `*1\\.*\n` : '';
    playersInfo.forEach((player, i) => {
        let formattedRow = Global_1.Global.BASE_ROW_PLAYER
            .replace('{{index}}', (i + 1).toString())
            .replace('{{fullName}}', player.fullName)
            .replace('{{fdateReservation}}', player.dateTimeReservation)
            .replace(/{{bold}}/gi, chatId === Number(player.chatId) ? '*' : '');
        listPlayers += formattedRow;
    });
    return listPlayers;
} // end formattedRowPlayer
// Inicia el bot
bot.launch();
