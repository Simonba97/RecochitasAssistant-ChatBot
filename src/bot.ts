import { Markup, Telegraf } from 'telegraf';
import * as config from './config/config.json';
import { IInfoMatchItem } from './models/IInfoMatchItem';
import { IMatchQuotasItem } from './models/IMatchQuotasItem';
import { parse, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { IPlayerInformationItem } from './models/IPlayerInformationItem';
import { Global } from './utils/Global';
import { FileService } from './services/FileService';
import { InfoMatchService } from './services/InfoMatchService';
import { MatchQuotasService } from './services/MatchQuotasService';
import { ReservationCancellationHistoryService } from './services/ReservationCancellationHistoryService';

// Importa el módulo 'config'
const bot = new Telegraf(config.BOT_TOKEN);
// Services
const _fileService: FileService = new FileService();
const _infoMatchService: InfoMatchService = new InfoMatchService(_fileService);
const _matchQuotasService: MatchQuotasService = new MatchQuotasService(_fileService);
const _reservationCancellationHistoryService: ReservationCancellationHistoryService = new ReservationCancellationHistoryService(_fileService);

// Maneja mensajes de texto
bot.on('text', async (ctx) => {

    // Consulta de información del partido 
    const infoMatchData: IInfoMatchItem = await _infoMatchService.getMatch();

    if (infoMatchData.available) {
        // Crear un teclado personalizado con opciones
        const keyboard = Markup.inlineKeyboard([
            [Markup.button.callback('CONOCER INFORMACIÓN DEL PARTIDO ⏰', 'infoGame')],
            [Markup.button.callback('VER LISTA DE CUPOS DEL PARTIDO 📄', 'seeListQuotas')],
            [Markup.button.callback('RESERVAR MI CUPO PARA EL COTEJO ✍🏽', 'reserveSpot')],
            [Markup.button.callback('CANCELAR MI CUPO PARA EL COTEJO ✍🏽', 'removeSpot')]
        ]);

        // Enviar un mensaje con el teclado
        ctx.reply(Global.MSG_WELCOME, keyboard);
    } else {
        ctx.replyWithMarkdownV2(Global.MSG_NO_MATCH_PROGRAMMING);
    }

});

/**
 * Acción del bot para proporcionar información sobre un partido.
 * Consulta la información del partido, formatea la fecha y hora, y responde con detalles del partido, incluyendo ubicación, campo de fútbol, fecha y precio.
 * @param {Context} ctx - El contexto de la conversación del bot.
 * @memberof bot.ts
 */
bot.action('infoGame', async (ctx) => {

    let message: string = "";

    // Consulta de información del partido
    const infoMatchData: IInfoMatchItem = await _infoMatchService.getMatch();

    // Formateamos la fecha para presentarla adecuadamente
    const dateMatch = infoMatchData.fullDate;
    const fecha = parse(dateMatch, "dd/MM/yyyy HH:mm", new Date());

    // Mensaje de respuesta con información del partido
    message = Global.BASE_MATCH_INFO
        .replace('{{ubication}}', infoMatchData.ubication)
        .replace('{{soccerField}}', infoMatchData.soccerField)
        .replace('{{fullDate}}', format(fecha, "EEEE, d 'de' MMMM 'de' yyyy 'a las' h:mm a", { locale: es }))
        .replace('{{price}}', infoMatchData.price);

    // Respuesta del ChatBot
    ctx.replyWithMarkdownV2(message);

}); // end infoGame

bot.action('seeListQuotas', async (ctx) => {
    const response = await printListQuotas(Number(ctx.update.callback_query.message?.chat.id));
    ctx.replyWithMarkdownV2(response);
}); // end seeListQuotas

bot.action('reserveSpot', async (ctx) => {

    // Buscamos si ya existe una reserva por el usuario
    const messageData: any = ctx.update.callback_query.message;
    const haveReservation = await _matchQuotasService.getReservationByChatId(messageData.chat.id);

    // Control para que no se pueda reservar si ya tiene una reserva activa
    if (haveReservation) {
        ctx.replyWithMarkdownV2(Global.MSG_RESERVE_FAIL);
        return;
    }

    const options = Markup.inlineKeyboard([
        [Markup.button.callback('PORTERO', 'typePlayerGoalkeeper'), Markup.button.callback('DEFENSA', 'typePlayerDefence')],
        [Markup.button.callback('MEDIOCAMPISTA', 'typePlayerMidfielder'), Markup.button.callback('DELANTERO', 'typePlayerForward')]
    ]);

    // Enviar un mensaje con el teclado
    ctx.reply('¿DE QUÉ JUGÁS? 🤔', options);

}); // end reserveSpot


bot.action('removeSpot', async (ctx) => {

    // Buscamos si ya existe una reserva por el usuario
    const messageData: any = ctx.update.callback_query.message;
    const haveReservation = await _matchQuotasService.getReservationByChatId(messageData.chat.id);

    // Control para que no se pueda reservar si ya tiene una reserva activa
    if (!haveReservation) {
        ctx.replyWithMarkdownV2(Global.MSG_NO_RESERVE_SPOT);
        return;
    }

    const confirmOptions = Markup.inlineKeyboard([
        [Markup.button.callback('NO ❌', 'confirmRemoveSpot_false'), Markup.button.callback('SI ✅', 'confirmRemoveSpot_true')]
    ]);

    ctx.replyWithMarkdownV2(Global.MSG_DESCRIPTION_CONFIRM_REMOVE_SPOT);
    ctx.reply(Global.MSG_TITLE_CONFIRM_REMOVE_SPOT, confirmOptions);

}); // end manageSpot

bot.action(/confirmRemoveSpot.*/, async (ctx) => {
    const confirmationRemoveSpot: boolean = ctx.match[0].replace('confirmRemoveSpot_', '') === 'true';
    if (!confirmationRemoveSpot) {
        ctx.replyWithMarkdownV2('No se cancelo tu reserva');
        return;
    }

    /* Información del jugador a cancelar */
    const chatId = Number(ctx.update.callback_query.message?.chat.id);

    /* Cancelación de la reserva */
    const reservationPlayer: IPlayerInformationItem | undefined = await _matchQuotasService.removeReserve(chatId);
    /* Adición del Historial de cancelación */
    await _reservationCancellationHistoryService.addCancellation(reservationPlayer);

    // Mensaje de confirmación de la Cancelación
    ctx.replyWithMarkdownV2(Global.MSG_REMOVE_SPOT_SUCCESS);

}); // end reserveSpot

bot.action(/typePlayer.*/, async (ctx) => {
    const messageData: any = ctx.update.callback_query.message;
    _matchQuotasService.addReserve(messageData, ctx.match[0]);

    // Mensaje de confirmación de reserva para el usuario
    ctx.replyWithMarkdownV2(Global.MSG_RESERVE_SUCCESS);
}); // end reserveSpot

/**
 * Imprime una lista de jugadores en formato tabular.
 * @param {number} chatId - El chatId del jugador para resaltar en la lista.
 * @returns {Promise<string>} - Una promesa que se resuelve con una cadena de texto que representa la lista de jugadores.
 */
async function printListQuotas(chatId: number): Promise<string> {
    try {
        const infoMatchQuotas: IMatchQuotasItem = await _matchQuotasService.getAllMatchQuotas();

        // Formatea las filas de jugadores para cada categoría.
        const bodyGoalkeeper = formattedRowPlayer(infoMatchQuotas.goalkeepers, chatId);
        const bodyPlayers = formattedRowPlayer(infoMatchQuotas.players, chatId);
        const bodySubstitutes = formattedRowPlayer(infoMatchQuotas.substitutes, chatId);

        // Reemplaza las etiquetas en la plantilla base con los datos formateados.
        const result = Global.BASE_ALL_LIST_PLAYERS
            .replace('{{bodyGoalkeeper}}', bodyGoalkeeper)
            .replace('{{bodyPlayers}}', bodyPlayers)
            .replace('{{bodySubstitutes}}', bodySubstitutes);

        return result;
    } catch (error) {
        // Manejo de errores, como archivo no encontrado o problemas en el formato.
        throw new Error(`Error al imprimir la lista de jugadores: ${error}`);
    }
} // end printListQuotas

/**
 * Formatea las filas de información de los jugadores en una lista.
 * @param {IPlayerInformationItem[]} playersInfo - La información de los jugadores a formatear.
 * @param {number} chatId - El chatId del jugador para resaltar en la lista.
 * @returns {string} - Una cadena de texto que representa las filas formateadas de la lista de jugadores.
 */
function formattedRowPlayer(playersInfo: IPlayerInformationItem[], chatId: number): string {
    let listPlayers = playersInfo.length === 0 ? `*1\\.*\n` : '';

    playersInfo.forEach((player, i) => {
        const formattedRow = Global.BASE_ROW_PLAYER
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