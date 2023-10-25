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
// Importa el módulo 'config'
const config = __importStar(require("./config/config.json"));
const fs_1 = require("fs");
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
// Utiliza las constantes en tu código
const telegramToken = config.BOT_TOKEN;
// Importa el módulo 'config'
const bot = new telegraf_1.Telegraf(telegramToken); // Reemplaza 'TU_TOKEN_AQUI' con tu token de Telegram
// Maneja mensajes de texto
bot.on('text', (ctx) => {
    // Crear un teclado personalizado con opciones
    const keyboard = telegraf_1.Markup.inlineKeyboard([
        telegraf_1.Markup.button.callback('CONOCER INFORMACIÓN DEL PARTIDO ⏰', 'infoGame'),
        telegraf_1.Markup.button.callback('RESERVAR MI CUPO PARA EL COTEJO ✍🏽', 'reserveSpot'),
    ]);
    // Enviar un mensaje con el teclado
    ctx.reply('¡Bienvenido al Asistente Virtual de Recochitas F.C.!', keyboard);
});
// Manejar las acciones de los botones
bot.action('infoGame', (ctx) => {
    //Archivo donde se almacena la información del partido
    const filePath = 'src/data/infoMatch.json';
    //Leemos la información del partido
    readFile(filePath)
        .then((response) => {
        let message = "";
        const infoMatchData = response;
        if (infoMatchData.available) { // Si existe partido disponible
            // Formateamos la fecha para presentarla adecuadamente
            const dateMatch = infoMatchData.fulldate;
            const fecha = (0, date_fns_1.parse)(dateMatch, "dd/MM/yyyy HH:mm", new Date());
            // Mensaje de respuesta con información del partido
            message = `\n` +
                `ℹ️ *INFORMACIÓN DEL PARTIDO PROGRAMADO:* ℹ️\n` +
                `\n` +
                `📍 *Cancha:* ${infoMatchData.ubication}\n` +
                `🏟️ *Numero de cancha:* ${infoMatchData.soccerField}\n` +
                `📆 *Fecha y hora:* ${(0, date_fns_1.format)(fecha, "EEEE, d 'de' MMMM 'de' yyyy 'a las' h:mm a", { locale: locale_1.es })}\n` +
                `💸 *Costo:* ${infoMatchData.price}\n` +
                `\n`;
        }
        else { // Si no existe partido disponible
            // Mensaje de respuesta con información 
            message = '\n' +
                '🥲 *LO SENTIMOS MUCHO*🥲 \n' +
                '❌⚽️ _Aún no hay programación para encarar la pecosa_ ⚽️❌' +
                '\n';
        }
        ctx.replyWithMarkdownV2(message);
    })
        .catch((error) => {
        ctx.reply('Error al leer los datos del partido.');
        console.error(error);
        return;
    });
}); // end infoGame
bot.action('reserveSpot', (ctx) => {
    const options = telegraf_1.Markup.inlineKeyboard([
        telegraf_1.Markup.button.callback('PORTERO', 'typePlayerGoalkeeper'),
        telegraf_1.Markup.button.callback('DEFENSA', 'typePlayerDefence'),
        telegraf_1.Markup.button.callback('MEDIOCAMPISTA', 'typePlayerMidfielder'),
        telegraf_1.Markup.button.callback('DELANTERO', 'typePlayerForward'),
    ]);
    // Enviar un mensaje con el teclado
    ctx.reply('¿DE QUÉ JUGÁS? 🤔', options);
}); // end reserveSpot
bot.action('typePlayerGoalkeeper', (ctx) => {
    // Información del usuario actual
    const messageData = ctx.update.callback_query.message;
    // Archivo donde se almacena la información de las reservas
    const filePath = 'src/data/matchQuotas.json';
    // Leemos el archivo
    readFile(filePath)
        .then((response) => {
        const infoMatchQuotas = response;
        const reservationAvailable = infoMatchQuotas.goalkeepers.length < 3;
        if (reservationAvailable) {
            // Agregar información en la titular
            infoMatchQuotas.goalkeepers.push({
                dateTimeReservation: (0, date_fns_1.format)(new Date(), "dd/MM/yyyy HH:mm:ss"),
                fullName: `${messageData === null || messageData === void 0 ? void 0 : messageData.chat.first_name} ${messageData === null || messageData === void 0 ? void 0 : messageData.chat.last_name}`,
                pay: false,
                postion: 'Goalkeeper',
                chatId: messageData.chat.id
            });
        }
        else {
            // Agregar información en los sustitutos
            infoMatchQuotas.substitutes.push({
                dateTimeReservation: (0, date_fns_1.format)(new Date(), "dd/MM/yyyy HH:mm:ss"),
                fullName: `${messageData === null || messageData === void 0 ? void 0 : messageData.chat.first_name} ${messageData === null || messageData === void 0 ? void 0 : messageData.chat.last_name}`,
                pay: false,
                postion: 'Goalkeeper',
                chatId: messageData.chat.id
            });
        }
        // Guarda los datos en el archivo JSON
        fs_1.promises.writeFile(filePath, JSON.stringify(infoMatchQuotas, null, 2));
    })
        .catch((error) => {
    });
}); // end reserveSpot
function readFile(filePath) {
    return fs_1.promises.readFile(filePath, 'utf8')
        .then((data) => JSON.parse(data));
} // end readFile
// Inicia el bot
bot.launch();
