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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const config = __importStar(require("./config/config.json"));
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
const Global_1 = require("./utils/Global");
const FileService_1 = require("./services/FileService");
const InfoMatchService_1 = require("./services/InfoMatchService");
const MatchQuotasService_1 = require("./services/MatchQuotasService");
const ReservationCancellationHistoryService_1 = require("./services/ReservationCancellationHistoryService");
// Importa el módulo 'config'
const bot = new telegraf_1.Telegraf(config.BOT_TOKEN);
// Services
const _fileService = new FileService_1.FileService();
const _infoMatchService = new InfoMatchService_1.InfoMatchService(_fileService);
const _matchQuotasService = new MatchQuotasService_1.MatchQuotasService(_fileService);
const _reservationCancellationHistoryService = new ReservationCancellationHistoryService_1.ReservationCancellationHistoryService(_fileService);
// Maneja mensajes de texto
bot.on('text', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    // Consulta de información del partido 
    const infoMatchData = yield _infoMatchService.getMatch();
    if (infoMatchData.available) {
        // Crear un teclado personalizado con opciones
        const keyboard = telegraf_1.Markup.inlineKeyboard([
            [telegraf_1.Markup.button.callback('CONOCER INFORMACIÓN DEL PARTIDO ⏰', 'infoGame')],
            [telegraf_1.Markup.button.callback('VER LISTA DE CUPOS DEL PARTIDO 📄', 'seeListQuotas')],
            [telegraf_1.Markup.button.callback('RESERVAR MI CUPO PARA EL COTEJO ✍🏽', 'reserveSpot')],
            [telegraf_1.Markup.button.callback('CANCELAR MI CUPO PARA EL COTEJO ✍🏽', 'removeSpot')]
        ]);
        // Enviar un mensaje con el teclado
        ctx.reply(Global_1.Global.MSG_WELCOME, keyboard);
    }
    else {
        ctx.replyWithMarkdownV2(Global_1.Global.MSG_NO_MATCH_PROGRAMMING);
    }
}));
/**
 * Acción del bot para proporcionar información sobre un partido.
 * Consulta la información del partido, formatea la fecha y hora, y responde con detalles del partido, incluyendo ubicación, campo de fútbol, fecha y precio.
 * @param {Context} ctx - El contexto de la conversación del bot.
 * @memberof bot.ts
 */
bot.action('infoGame', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    let message = "";
    // Consulta de información del partido
    const infoMatchData = yield _infoMatchService.getMatch();
    // Formateamos la fecha para presentarla adecuadamente
    const dateMatch = infoMatchData.fullDate;
    const fecha = (0, date_fns_1.parse)(dateMatch, "dd/MM/yyyy HH:mm", new Date());
    // Mensaje de respuesta con información del partido
    message = Global_1.Global.BASE_MATCH_INFO
        .replace('{{ubication}}', infoMatchData.ubication)
        .replace('{{soccerField}}', infoMatchData.soccerField)
        .replace('{{fullDate}}', (0, date_fns_1.format)(fecha, "EEEE, d 'de' MMMM 'de' yyyy 'a las' h:mm a", { locale: locale_1.es }))
        .replace('{{price}}', infoMatchData.price);
    // Respuesta del ChatBot
    ctx.replyWithMarkdownV2(message);
})); // end infoGame
bot.action('seeListQuotas', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const response = yield printListQuotas(Number((_a = ctx.update.callback_query.message) === null || _a === void 0 ? void 0 : _a.chat.id));
    ctx.replyWithMarkdownV2(response);
})); // end seeListQuotas
bot.action('reserveSpot', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    // Buscamos si ya existe una reserva por el usuario
    const messageData = ctx.update.callback_query.message;
    const haveReservation = yield _matchQuotasService.getReservationByChatId(messageData.chat.id);
    // Control para que no se pueda reservar si ya tiene una reserva activa
    if (haveReservation) {
        ctx.replyWithMarkdownV2(Global_1.Global.MSG_RESERVE_FAIL);
        return;
    }
    const options = telegraf_1.Markup.inlineKeyboard([
        [telegraf_1.Markup.button.callback('PORTERO', 'typePlayerGoalkeeper'), telegraf_1.Markup.button.callback('DEFENSA', 'typePlayerDefence')],
        [telegraf_1.Markup.button.callback('MEDIOCAMPISTA', 'typePlayerMidfielder'), telegraf_1.Markup.button.callback('DELANTERO', 'typePlayerForward')]
    ]);
    // Enviar un mensaje con el teclado
    ctx.reply('¿DE QUÉ JUGÁS? 🤔', options);
})); // end reserveSpot
bot.action('removeSpot', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    // Buscamos si ya existe una reserva por el usuario
    const messageData = ctx.update.callback_query.message;
    const haveReservation = yield _matchQuotasService.getReservationByChatId(messageData.chat.id);
    // Control para que no se pueda reservar si ya tiene una reserva activa
    if (!haveReservation) {
        ctx.replyWithMarkdownV2(Global_1.Global.MSG_NO_RESERVE_SPOT);
        return;
    }
    const confirmOptions = telegraf_1.Markup.inlineKeyboard([
        [telegraf_1.Markup.button.callback('NO ❌', 'confirmRemoveSpot_false'), telegraf_1.Markup.button.callback('SI ✅', 'confirmRemoveSpot_true')]
    ]);
    ctx.replyWithMarkdownV2(Global_1.Global.MSG_DESCRIPTION_CONFIRM_REMOVE_SPOT);
    ctx.reply(Global_1.Global.MSG_TITLE_CONFIRM_REMOVE_SPOT, confirmOptions);
})); // end manageSpot
bot.action(/confirmRemoveSpot.*/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const confirmationRemoveSpot = ctx.match[0].replace('confirmRemoveSpot_', '') === 'true';
    if (!confirmationRemoveSpot) {
        ctx.replyWithMarkdownV2('No se cancelo tu reserva');
        return;
    }
    /* Información del jugador a cancelar */
    const chatId = Number((_b = ctx.update.callback_query.message) === null || _b === void 0 ? void 0 : _b.chat.id);
    /* Cancelación de la reserva */
    const reservationPlayer = yield _matchQuotasService.removeReserve(chatId);
    /* Adición del Historial de cancelación */
    yield _reservationCancellationHistoryService.addCancellation(reservationPlayer);
    // Mensaje de confirmación de la Cancelación
    ctx.replyWithMarkdownV2(Global_1.Global.MSG_REMOVE_SPOT_SUCCESS);
})); // end reserveSpot
bot.action(/typePlayer.*/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const messageData = ctx.update.callback_query.message;
    _matchQuotasService.addReserve(messageData, ctx.match[0]);
    // Mensaje de confirmación de reserva para el usuario
    ctx.replyWithMarkdownV2(Global_1.Global.MSG_RESERVE_SUCCESS);
})); // end reserveSpot
/**
 * Imprime una lista de jugadores en formato tabular.
 * @param {number} chatId - El chatId del jugador para resaltar en la lista.
 * @returns {Promise<string>} - Una promesa que se resuelve con una cadena de texto que representa la lista de jugadores.
 */
function printListQuotas(chatId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const infoMatchQuotas = yield _matchQuotasService.getAllMatchQuotas();
            // Formatea las filas de jugadores para cada categoría.
            const bodyGoalkeeper = formattedRowPlayer(infoMatchQuotas.goalkeepers, chatId);
            const bodyPlayers = formattedRowPlayer(infoMatchQuotas.players, chatId);
            const bodySubstitutes = formattedRowPlayer(infoMatchQuotas.substitutes, chatId);
            // Reemplaza las etiquetas en la plantilla base con los datos formateados.
            const result = Global_1.Global.BASE_ALL_LIST_PLAYERS
                .replace('{{bodyGoalkeeper}}', bodyGoalkeeper)
                .replace('{{bodyPlayers}}', bodyPlayers)
                .replace('{{bodySubstitutes}}', bodySubstitutes);
            return result;
        }
        catch (error) {
            // Manejo de errores, como archivo no encontrado o problemas en el formato.
            throw new Error(`Error al imprimir la lista de jugadores: ${error}`);
        }
    });
} // end printListQuotas
/**
 * Formatea las filas de información de los jugadores en una lista.
 * @param {IPlayerInformationItem[]} playersInfo - La información de los jugadores a formatear.
 * @param {number} chatId - El chatId del jugador para resaltar en la lista.
 * @returns {string} - Una cadena de texto que representa las filas formateadas de la lista de jugadores.
 */
function formattedRowPlayer(playersInfo, chatId) {
    let listPlayers = playersInfo.length === 0 ? `*1\\.*\n` : '';
    playersInfo.forEach((player, i) => {
        const formattedRow = Global_1.Global.BASE_ROW_PLAYER
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
