"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Global = void 0;
var Global;
(function (Global) {
    /* CONSTANTES DE LOS TIPOS DE JUGADORES */
    Global["TYPE_GOALKEEPER"] = "typePlayerGoalkeeper";
    Global["TYPE_DEFENCE"] = "typePlayerDefence";
    Global["TYPE_MIDFIELDER"] = "typePlayerMidfielder";
    Global["TYPE_FORWARD"] = "typePlayerForward";
    /* RUTAS DE ARCHIVOS */
    Global["FILEPATH_INFOMATCH"] = "src/data/infoMatch.json";
    Global["FILEPATH_MATCHQUOTAS"] = "src/data/matchQuotas.json";
    Global["FILEPATH_CANCELLATIONHISTORY"] = "src/data/cancellationHistory.json";
    /* MENSAJES DEL BOT */
    Global["MSG_WELCOME"] = "\u00A1Bienvenido al Asistente Virtual de Recochitas F.C.!";
    Global["MSG_RESERVE_FAIL"] = "\n*YA TIENES UNA RESERVA ACTIVA* \uD83E\uDD72 \n_No te puedes volver a inscribri, ya tienes una reserva activa_ \u26BD\uFE0F\u274C\n";
    Global["MSG_RESERVE_SUCCESS"] = "\n*RESERVA EXITOSA* \u2705 \n_Se realiz\u00F3 la reserva para el partido correctamente_ \u270D\uD83C\uDFFD\n";
    Global["MSG_NO_RESERVE_SPOT"] = "\n*NO TIENES UNA RESERVA PARA CANCELAR* \uD83E\uDD72 \n_No tienes una reserva activa para cancelar en el partido_ \u26BD\uFE0F\u274C\n";
    Global["MSG_NO_MATCH_PROGRAMMING"] = "\n*LO SENTIMOS MUCHO* \uD83E\uDD72 \n_A\u00FAn no hay programaci\u00F3n para encarar la pecosa_ \u26BD\uFE0F\u274C\n";
    Global["MSG_CATCH_ERROR"] = "\u00A1Ups! Parece que ha ocurrido un error en el proceso. Lamentamos las molestias.";
    Global["MSG_TITLE_CONFIRM_REMOVE_SPOT"] = "\u00BFDESEAS CANCELAR TU CUPO?";
    Global["MSG_DESCRIPTION_CONFIRM_REMOVE_SPOT"] = "\n \u26A0\uFE0F *ANTES DE CONTINUAR CON EL PROCESO RECUERDA:* \u26A0\uFE0F \n1\uFE0F\u20E3 Luego de confirmada la cancelaci\u00F3n de tu cupo, perder\u00E1s tu posici\u00F3n prioritaria en este partido\n2\uFE0F\u20E3 Puedes volver a reservar el cupo que cancelaste, pero no se asegura que qued\u00E9 en la misma prioridad de antes\n3\uFE0F\u20E3 Las cancelaciones se deben realizar antes de las 6:00 PM del d\u00EDa, si se realiza posterior a esta hora se le asignar\u00E1 una multa\n";
    Global["MSG_REMOVE_SPOT_SUCCESS"] = "\n*CANCELACI\u00D3N DE CUPO EXITOSA* \u2705 \n_Se cancel\u00F3 la reserva de tu cupo correctamente_ \u270D\uD83C\uDFFD\n";
    /* PLANTILLAS BASES DE DATOS */
    Global["BASE_MATCH_INFO"] = "\n\u2139\uFE0F *INFORMACI\u00D3N DEL PARTIDO PROGRAMADO:* \u2139\uFE0F\n\n\uD83D\uDCCD *Cancha:* {{ubication}}\n\uD83C\uDFDF\uFE0F *Numero de cancha:* {{soccerField}}\n\uD83D\uDCC6 *Fecha y hora:* {{fullDate}}\n\uD83D\uDCB8 *Costo:* {{price}}\n\n";
    Global["BASE_ALL_LIST_PLAYERS"] = "\n*LISTA DE RESERVAS DE JUGADORES TITULARES Y RESERVAS* \uD83D\uDCC4\n_Campo Amor // Jueves, 26 de Octubre a las 9:00 PM_\n\n*PORTEROS:* \uD83E\uDDE4\n{{bodyGoalkeeper}}\n*JUGADORES:* \uD83D\uDC64\n{{bodyPlayers}}\n*RESERVA:* \uD83D\uDD04\n{{bodySubstitutes}}\n";
    Global["BASE_ROW_PLAYER"] = "*{{index}}\\.* {{bold}}{{fullName}} \\({{fdateReservation}}\\){{bold}}\n";
})(Global || (exports.Global = Global = {})); // end Global
