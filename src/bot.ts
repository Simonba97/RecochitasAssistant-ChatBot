import { Markup, Telegraf } from 'telegraf';
import * as config from './config/config.json';
import { IInfoMatchItem } from './models/IInfoMatchItem';
import { promises as fs } from 'fs';
import { IMatchQuotasItem } from './models/IMatchQuotasItem';
import { parse, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { IPlayerInformationItem } from './models/IPlayerInformationItem';
import { Global } from './utils/Global';

// Utiliza las constantes en tu código
const telegramToken = config.BOT_TOKEN;

// Importa el módulo 'config'
const bot = new Telegraf(telegramToken); // Reemplaza 'TU_TOKEN_AQUI' con tu token de Telegram

// Maneja mensajes de texto
bot.on('text', (ctx) => {

    // Crear un teclado personalizado con opciones
    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('CONOCER INFORMACIÓN DEL PARTIDO ⏰', 'infoGame')],
        [Markup.button.callback('VER LISTA DE CUPOS DEL PARTIDO 📄', 'seeListQuotas')],
        [Markup.button.callback('RESERVAR MI CUPO PARA EL COTEJO ✍🏽', 'reserveSpot')]
    ]);

    // Enviar un mensaje con el teclado
    ctx.reply('¡Bienvenido al Asistente Virtual de Recochitas F.C.!', keyboard);
});

// Manejar las acciones de los botones
bot.action('infoGame', (ctx) => {

    //Leemos la información del partido
    readFile(Global.FILEPATH_INFOMATCH)
        .then((response) => {

            let message: string = "";
            const infoMatchData: IInfoMatchItem = response;

            if (infoMatchData.available) { // Si existe partido disponible

                // Formateamos la fecha para presentarla adecuadamente
                const dateMatch = infoMatchData.fullDate;
                const fecha = parse(dateMatch, "dd/MM/yyyy HH:mm", new Date());

                // Mensaje de respuesta con información del partido
                message = `\n` +
                    `ℹ️ *INFORMACIÓN DEL PARTIDO PROGRAMADO:* ℹ️\n` +
                    `\n` +
                    `📍 *Cancha:* ${infoMatchData.ubication}\n` +
                    `🏟️ *Numero de cancha:* ${infoMatchData.soccerField}\n` +
                    `📆 *Fecha y hora:* ${format(fecha, "EEEE, d 'de' MMMM 'de' yyyy 'a las' h:mm a", { locale: es })}\n` +
                    `💸 *Costo:* ${infoMatchData.price}\n` +
                    `\n`;

            } else { // Si no existe partido disponible
                // Mensaje de respuesta con información 
                message = '\n' +
                    '*LO SENTIMOS MUCHO* 🥲 \n' +
                    '_Aún no hay programación para encarar la pecosa_ ⚽️❌' +
                    '\n';
            }

            ctx.replyWithMarkdownV2(message);
        })
        .catch((error) => {
            ctx.reply('¡Ups! Parece que ha ocurrido un error en el proceso. Lamentamos las molestias.');
            return;
        });

}); // end infoGame

bot.action('seeListQuotas', (ctx) => {
    printListQuotas(Number(ctx.update.callback_query.message?.chat.id))
        .then((response) => {
            ctx.replyWithMarkdownV2(response);
        });
}); // end seeListQuotas

bot.action('reserveSpot', (ctx) => {

    const options = Markup.inlineKeyboard([
        [Markup.button.callback('PORTERO', 'typePlayerGoalkeeper'), Markup.button.callback('DEFENSA', 'typePlayerDefence')],
        [Markup.button.callback('MEDIOCAMPISTA', 'typePlayerMidfielder'), Markup.button.callback('DELANTERO', 'typePlayerForward')]
    ]);

    // Enviar un mensaje con el teclado
    ctx.reply('¿DE QUÉ JUGÁS? 🤔', options);

}); // end reserveSpot

bot.action(/typePlayer.*/, (ctx) => {
    const selectedOption: string = ctx.match[0];
    const typePlayer = selectedOption != Global.TYPE_GOALKEEPER ? 'goalkeeper' : 'players';

    // Información del usuario actual
    const messageData: any = ctx.update.callback_query.message;
    // Archivo donde se almacena la información de las reservas
    // Mensaje de respuesta
    let message: string = "";

    // Leemos el archivo
    readFile(Global.FILEPATH_MATCHQUOTAS)
        .then((response) => {

            // Información las cuotas del partido
            const infoMatchQuotas: IMatchQuotasItem = response;

            // Buscamos si ya existe una reserva por el usuario
            const haveReservation = findReservationByChatId(infoMatchQuotas, messageData.chat.id);

            // Control para que no se pueda reservar si ya tiene una reserva activa
            if (haveReservation) {
                message = '\n' +
                    '*YA TIENES UNA RESERVA ACTIVA* 🥲 \n' +
                    '_No te puedes volver a inscribri, ya tienes una reserva activa_ ⚽️❌' +
                    '\n';
                ctx.replyWithMarkdownV2(message);
                return;
            }

            // Control para determinar si la reserva se realiza en la titular o suplencia
            const reservationAvailable = selectedOption === Global.TYPE_GOALKEEPER
                ? infoMatchQuotas.goalkeepers.length < 2
                : infoMatchQuotas.players.length < 16;

            // Información del usuario para la reserva ya bien sea en la titular o suplencia
            const infoReservation: IPlayerInformationItem = {
                dateTimeReservation: format(new Date(), "dd/MM/yyyy HH:mm:ss"),
                fullName: `${messageData?.chat.first_name} ${messageData?.chat.last_name}`.replace(/[^\w\s]/gi, ''),
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
            fs.writeFile(Global.FILEPATH_MATCHQUOTAS, JSON.stringify(infoMatchQuotas, null, 2))
                .then(() => {
                    // Mensaje de confirmación de reserva para el usuario
                    message = '\n' +
                        '*RESERVA EXITOSA* ✅ \n' +
                        '_Se realizó la reserva para el partido correctamente_ ✍🏽' +
                        '\n';
                    ctx.replyWithMarkdownV2(message);

                    //Detener el Bot
                    bot.stop();
                    return;
                })
                .catch((error) => {
                    ctx.reply('¡Ups! Parece que ha ocurrido un error en el proceso. Lamentamos las molestias.');
                    return;
                });

        })
        .catch((error) => {
            ctx.reply('¡Ups! Parece que ha ocurrido un error en el proceso. Lamentamos las molestias.');
            return;
        });

}); // end reserveSpot

function readFile(filePath: string): Promise<any> {
    return fs.readFile(filePath, 'utf8')
        .then((data: string) => JSON.parse(data));
} // end readFile

function findReservationByChatId(infoMatchQuotas: IMatchQuotasItem, chatId: number): IPlayerInformationItem | undefined {
    //Buscar si existe alguna reserva
    return infoMatchQuotas.goalkeepers.find((player) => Number(player.chatId) === chatId) ||
        infoMatchQuotas.players.find((player) => Number(player.chatId) === chatId) ||
        infoMatchQuotas.substitutes.find((player) => Number(player.chatId) === chatId);
} // end findReservationByChatId

function printListQuotas(chatId: number): Promise<string> {
    return readFile(Global.FILEPATH_MATCHQUOTAS)
        .then((response) => {
            const infoMatchQuotas: IMatchQuotasItem = response;
            const baseAllListPlayers = `\n` +
                `*LISTA DE RESERVAS DE JUGADORES TITULARES Y RESERVAS* 📄\n` +
                `_Campo Amor // Jueves, 26 de Octubre a las 9:00 PM_\n` +
                `\n` +
                `*PORTEROS:* 🧤\n` +
                `{{bodyGoalkeeper}}` +
                `\n` +
                `*JUGADORES:* 👤\n` +
                `{{bodyPlayers}}` +
                `\n` +
                `*RESERVA:* 🔄\n` +
                `{{bodySubstitutes}}` +
                `\n`;

            let bodyGoalkeeper = formattedRowPlayer(infoMatchQuotas.goalkeepers, chatId);
            let bodyPlayers = formattedRowPlayer(infoMatchQuotas.players, chatId);
            let bodySubstitutes = formattedRowPlayer(infoMatchQuotas.substitutes, chatId);

            return baseAllListPlayers
                .replace('{{bodyGoalkeeper}}', bodyGoalkeeper)
                .replace('{{bodyPlayers}}', bodyPlayers)
                .replace('{{bodySubstitutes}}', bodySubstitutes);

        });
} // end printListQuotas

function formattedRowPlayer(playersInfo: IPlayerInformationItem[], chatId: number): string {

    const baseRowPlayer = `*{{index}}\\.* {{bold}}{{fullName}} \\({{fdateReservation}}\\){{bold}}\n`;
    let listPlayers = playersInfo.length === 0 ? `*1\\.*\n` : '';

    playersInfo.forEach((player, i) => {
        let formattedRow = baseRowPlayer
            .replace('{{index}}', (i + 1).toString())
            .replace('{{fullName}}', player.fullName)
            .replace('{{fdateReservation}}', player.dateTimeReservation)
            .replace(/{{bold}}/gi, chatId === Number(player.chatId) ? '*' : '');

        listPlayers += formattedRow;
    });

    return listPlayers
} // end formattedRowPlayer

// Inicia el bot
bot.launch();