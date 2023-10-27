export enum Global {
    /* CONSTANTES DE LOS TIPOS DE JUGADORES */
    TYPE_GOALKEEPER = 'typePlayerGoalkeeper',
    TYPE_DEFENCE = 'typePlayerDefence',
    TYPE_MIDFIELDER = 'typePlayerMidfielder',
    TYPE_FORWARD = 'typePlayerForward',

    /* RUTAS DE ARCHIVOS */
    FILEPATH_INFOMATCH = 'src/data/infoMatch.json',
    FILEPATH_MATCHQUOTAS = 'src/data/matchQuotas.json',
    FILEPATH_CANCELLATIONHISTORY = 'src/data/cancellationHistory.json',

    /* MENSAJES DEL BOT */
    MSG_WELCOME = '¡Bienvenido al Asistente Virtual de Recochitas F.C.!',
    MSG_RESERVE_FAIL = '\n' +
    '*YA TIENES UNA RESERVA ACTIVA* 🥲 \n' +
    '_No te puedes volver a inscribri, ya tienes una reserva activa_ ⚽️❌' +
    '\n',
    MSG_RESERVE_SUCCESS = '\n' +
    '*RESERVA EXITOSA* ✅ \n' +
    '_Se realizó la reserva para el partido correctamente_ ✍🏽' +
    '\n',
    MSG_NO_RESERVE_SPOT = '\n' +
    '*NO TIENES UNA RESERVA PARA CANCELAR* 🥲 \n' +
    '_No tienes una reserva activa para cancelar en el partido_ ⚽️❌' +
    '\n',
    MSG_NO_MATCH_PROGRAMMING = '\n' +
    '*LO SENTIMOS MUCHO* 🥲 \n' +
    '_Aún no hay programación para encarar la pecosa_ ⚽️❌' +
    '\n',
    MSG_CATCH_ERROR = '¡Ups! Parece que ha ocurrido un error en el proceso. Lamentamos las molestias.',
    MSG_TITLE_CONFIRM_REMOVE_SPOT = '¿DESEAS CANCELAR TU CUPO?',
    MSG_DESCRIPTION_CONFIRM_REMOVE_SPOT = '\n' +
    ' ⚠️ *ANTES DE CONTINUAR CON EL PROCESO RECUERDA:* ⚠️ \n' +
    '1️⃣ Luego de confirmada la cancelación de tu cupo, perderás tu posición prioritaria en este partido\n' +
    '2️⃣ Puedes volver a reservar el cupo que cancelaste, pero no se asegura que quedé en la misma prioridad de antes\n' +
    '3️⃣ Las cancelaciones se deben realizar antes de las 6:00 PM del día, si se realiza posterior a esta hora se le asignará una multa' +
    '\n',
    MSG_REMOVE_SPOT_SUCCESS = '\n' +
    '*CANCELACIÓN DE CUPO EXITOSA* ✅ \n' +
    '_Se canceló la reserva de tu cupo correctamente_ ✍🏽' +
    '\n',

    /* PLANTILLAS BASES DE DATOS */
    BASE_MATCH_INFO = `\n` +
    `ℹ️ *INFORMACIÓN DEL PARTIDO PROGRAMADO:* ℹ️\n` +
    `\n` +
    `📍 *Cancha:* {{ubication}}\n` +
    `🏟️ *Numero de cancha:* {{soccerField}}\n` +
    `📆 *Fecha y hora:* {{fullDate}}\n` +
    `💸 *Costo:* {{price}}\n` +
    `\n`,
    BASE_ALL_LIST_PLAYERS = `\n` +
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
    `\n`,
    BASE_ROW_PLAYER = `*{{index}}\\.* {{bold}}{{fullName}} \\({{fdateReservation}}\\){{bold}}\n`,


} // end Global