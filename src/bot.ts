import { Markup, Telegraf } from 'telegraf';
import * as config from './config/config.json';
import { IInfoMatchItem } from './models/IInfoMatchItem';
import { promises as fs } from 'fs';
import { IMatchQuotasItem } from './models/IMatchQuotasItem';
import { parse, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { IPlayerInformationItem } from './models/IPlayerInformationItem';

// Utiliza las constantes en tu código
const telegramToken = config.BOT_TOKEN;

// Importa el módulo 'config'
const bot = new Telegraf(telegramToken); // Reemplaza 'TU_TOKEN_AQUI' con tu token de Telegram

// Maneja mensajes de texto
bot.on('text', (ctx) => {

    // Crear un teclado personalizado con opciones
    const keyboard = Markup.inlineKeyboard([
        Markup.button.callback('CONOCER INFORMACIÓN DEL PARTIDO ⏰', 'infoGame'),
        Markup.button.callback('RESERVAR MI CUPO PARA EL COTEJO ✍🏽', 'reserveSpot'),
    ]);

    // Enviar un mensaje con el teclado
    ctx.reply('¡Bienvenido al Asistente Virtual de Recochitas F.C.!', keyboard);
});

// Manejar las acciones de los botones
bot.action('infoGame', (ctx) => {

    //Archivo donde se almacena la información del partido
    const filePath: string = 'src/data/infoMatch.json';

    //Leemos la información del partido
    readFile(filePath)
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
            ctx.reply('Error al leer los datos del partido.');
            console.error(error);
            return;
        });

}); // end infoGame

bot.action('reserveSpot', (ctx) => {

    const options = Markup.inlineKeyboard([
        Markup.button.callback('PORTERO', 'typePlayerGoalkeeper'),
        Markup.button.callback('DEFENSA', 'typePlayerDefence'),
        Markup.button.callback('MEDIOCAMPISTA', 'typePlayerMidfielder'),
        Markup.button.callback('DELANTERO', 'typePlayerForward'),
    ]);

    // Enviar un mensaje con el teclado
    ctx.reply('¿DE QUÉ JUGÁS? 🤔', options);

}); // end reserveSpot

bot.action('typePlayerGoalkeeper', (ctx) => {
    // Información del usuario actual
    const messageData: any = ctx.update.callback_query.message;
    // Archivo donde se almacena la información de las reservas
    const filePath: string = 'src/data/matchQuotas.json';
    // Mensaje de respuesta
    let message: string = "";

    // Leemos el archivo
    readFile(filePath)
        .then((response) => {

            const infoMatchQuotas: IMatchQuotasItem = response;
            const haveReservation = findReservationByChatId(infoMatchQuotas, messageData.chat.id);

            // Control para que no se pueda reservar si ya tiene una reserva activa
            if (haveReservation) {
                message = '\n' +
                    '*NO PUEDES RESERVAR* 🥲 \n' +
                    '_Ya existe una reserva activa a tu nombre_ ⚽️❌' +
                    '\n';
                ctx.replyWithMarkdownV2(message);
                return;
            }

            const reservationAvailable: boolean = infoMatchQuotas.goalkeepers.length < 2;

            if (reservationAvailable) {
                // Agregar información en la titular
                infoMatchQuotas.goalkeepers.push({
                    dateTimeReservation: format(new Date(), "dd/MM/yyyy HH:mm:ss"),
                    fullName: `${messageData?.chat.first_name} ${messageData?.chat.last_name}`,
                    pay: false,
                    postion: 'Goalkeeper',
                    chatId: messageData.chat.id
                });
            } else {
                // Agregar información en los sustitutos
                infoMatchQuotas.substitutes.push({
                    dateTimeReservation: format(new Date(), "dd/MM/yyyy HH:mm:ss"),
                    fullName: `${messageData?.chat.first_name} ${messageData?.chat.last_name}`,
                    pay: false,
                    postion: 'Goalkeeper',
                    chatId: messageData.chat.id
                });
            }

            // Guarda los datos en el archivo JSON
            fs.writeFile(filePath, JSON.stringify(infoMatchQuotas, null, 2))
                .then((response) => {
                    // Mensaje de confirmación de reserva para el usuario
                    message = '\n' +
                        '*RESERVA EXITOSA* ✅ \n' +
                        '_Se realizó la reserva para el partido correctamente_ ✍🏽' +
                        '\n';
                    ctx.replyWithMarkdownV2(message);
                    return;
                })
                .catch((error) => {

                })


        })
        .catch((error) => {

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

// Inicia el bot
bot.launch();