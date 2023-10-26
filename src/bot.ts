import { Markup, Telegraf } from 'telegraf';
import * as config from './config/config.json';
import { IInfoMatchItem } from './models/IInfoMatchItem';
import { promises as fs } from 'fs';
import { IMatchQuotasItem } from './models/IMatchQuotasItem';
import { parse, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { IPlayerInformationItem } from './models/IPlayerInformationItem';
import { Global } from './utils/Global';

// Importa el módulo 'config'
const bot = new Telegraf(config.BOT_TOKEN);

// Maneja mensajes de texto
bot.on('text', async (ctx) => {

    // Consulta de información del partido 
    const infoMatchData: IInfoMatchItem = await getMatch();

    if (infoMatchData.available) {
        // Crear un teclado personalizado con opciones
        const keyboard = Markup.inlineKeyboard([
            [Markup.button.callback('CONOCER INFORMACIÓN DEL PARTIDO ⏰', 'infoGame')],
            [Markup.button.callback('VER LISTA DE CUPOS DEL PARTIDO 📄', 'seeListQuotas')],
            [Markup.button.callback('RESERVAR MI CUPO PARA EL COTEJO ✍🏽', 'reserveSpot')]
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
    const infoMatchData: IInfoMatchItem = await getMatch();

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

bot.action('reserveSpot', (ctx) => {

    const options = Markup.inlineKeyboard([
        [Markup.button.callback('PORTERO', 'typePlayerGoalkeeper'), Markup.button.callback('DEFENSA', 'typePlayerDefence')],
        [Markup.button.callback('MEDIOCAMPISTA', 'typePlayerMidfielder'), Markup.button.callback('DELANTERO', 'typePlayerForward')]
    ]);

    // Enviar un mensaje con el teclado
    ctx.reply('¿DE QUÉ JUGÁS? 🤔', options);

}); // end reserveSpot

bot.action(/typePlayer.*/, async (ctx) => {
    const selectedOption: string = ctx.match[0];

    // Información del usuario actual
    const messageData: any = ctx.update.callback_query.message;

    // Leemos el archivo
    const infoMatchQuotas: IMatchQuotasItem = await readFile(Global.FILEPATH_MATCHQUOTAS);

    // Buscamos si ya existe una reserva por el usuario
    const haveReservation = findReservationByChatId(infoMatchQuotas, messageData.chat.id);

    // Control para que no se pueda reservar si ya tiene una reserva activa
    if (haveReservation) {
        ctx.replyWithMarkdownV2(Global.MSG_RESERVE_FAIL);
        return;
    }

    // Control para determinar si la reserva se realiza en la titular o suplencia
    const reservationAvailable = selectedOption === Global.TYPE_GOALKEEPER
        ? infoMatchQuotas.goalkeepers.length < 2
        : infoMatchQuotas.players.length < 16;

    // Información del usuario para la reserva ya bien sea en la titular o suplencia
    const infoReservation: IPlayerInformationItem = {
        dateTimeReservation: format(new Date(), "dd/MM/yyyy HH:mm:ss"),
        fullName: `${messageData?.chat.first_name} ${messageData?.chat.last_name}`.replace(/[^\w\sáéíóúÁÉÍÓÚ]/gi, ''),
        pay: false,
        postion: selectedOption.replace('typePlayer', '').toLowerCase(),
        chatId: messageData.chat.id
    };

    // Almacenamos la reserva en la titular o la suplencia
    if (reservationAvailable) {
        const targetArray = selectedOption === Global.TYPE_GOALKEEPER
            ? infoMatchQuotas.goalkeepers
            : infoMatchQuotas.players;

        targetArray.push(infoReservation);
    } else {
        infoMatchQuotas.substitutes.push(infoReservation);
    }

    // Guarda los datos en el archivo JSON
    await writeFile(Global.FILEPATH_MATCHQUOTAS, infoMatchQuotas);
    // Mensaje de confirmación de reserva para el usuario
    ctx.replyWithMarkdownV2(Global.MSG_RESERVE_SUCCESS);

}); // end reserveSpot




/**
 * Lee un archivo y devuelve su contenido como un objeto JSON.
 * @param {string} filePath - La ruta del archivo a leer.
 * @returns {Promise<any>} - Una promesa que se resuelve con el contenido del archivo como un objeto JSON.
 */
async function readFile(filePath: string): Promise<any> {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Manejar errores, como archivo no encontrado o JSON inválido
        throw new Error(`Error al leer el archivo en ${filePath}: ${error}`);
    }
}

/**
 * Escribe un objeto como contenido JSON en un archivo.
 * @param {string} filePath - La ruta del archivo donde se escribirá el contenido.
 * @param {IMatchQuotasItem} infoMatchQuotas - Los datos que se escribirán en el archivo.
 * @returns {Promise<void>} - Una promesa que se resuelve cuando la escritura se completa con éxito.
 */
async function writeFile(filePath: string, infoMatchQuotas: IMatchQuotasItem): Promise<void> {
    try {
        const data = JSON.stringify(infoMatchQuotas, null, 2);
        await fs.writeFile(filePath, data);
    } catch (error) {
        // Manejar errores, como archivo no encontrado o problemas de escritura
        throw new Error(`Error al escribir en el archivo en ${filePath}: ${error}`);
    }
} // end writeFile

/**
 * Obtiene la información de un partido desde un archivo.
 * @returns {Promise<IInfoMatchItem>} - Una promesa que se resuelve con la información del partido.
 */
async function getMatch(): Promise<IInfoMatchItem> {
    try {
        // Leemos la información del partido y esperamos la respuesta
        const infoMatchData: IInfoMatchItem = await readFile(Global.FILEPATH_INFOMATCH);
        return infoMatchData;
    } catch (error) {
        // Manejar errores si la lectura del archivo falla
        console.error('Error al obtener la información del partido:', error);
        throw new Error('No se pudo obtener la información del partido.');
    }
} // end getMatch

/**
 * Busca una reserva por su chatId en las listas de jugadores de un partido.
 * @param {IMatchQuotasItem} infoMatchQuotas - Los datos del partido que incluyen las listas de jugadores.
 * @param {number} chatId - El chatId del jugador que se desea encontrar.
 * @returns {IPlayerInformationItem | undefined} - La información del jugador encontrado o undefined si no se encuentra.
 */
function findReservationByChatId(infoMatchQuotas: IMatchQuotasItem, chatId: number): IPlayerInformationItem | undefined {
    // Busca si existe alguna reserva en las diferentes listas de jugadores.
    const findInList = (playerList: IPlayerInformationItem[]) => playerList.find((player) => Number(player.chatId) === chatId);

    const goalkeeper = findInList(infoMatchQuotas.goalkeepers);
    const player = findInList(infoMatchQuotas.players);
    const substitute = findInList(infoMatchQuotas.substitutes);

    return goalkeeper || player || substitute;
} // end findReservationByChatId

/**
 * Imprime una lista de jugadores en formato tabular.
 * @param {number} chatId - El chatId del jugador para resaltar en la lista.
 * @returns {Promise<string>} - Una promesa que se resuelve con una cadena de texto que representa la lista de jugadores.
 */
async function printListQuotas(chatId: number): Promise<string> {
    try {
        const infoMatchQuotas: IMatchQuotasItem = await readFile(Global.FILEPATH_MATCHQUOTAS);

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