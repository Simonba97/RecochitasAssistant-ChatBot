import { IMatchQuotasItem } from "../models/IMatchQuotasItem";
import { IPlayerInformationItem } from "../models/IPlayerInformationItem";
import { Global } from "../utils/Global";
import { FileService } from "./FileService";
import { format } from 'date-fns';

/**
 * Servicio que contiene los metodos necesarios para gestionar un Match Quotas
 * @copyright 2023 - El uso de esta libreria esta reservador para este sitio y cualquier cambio o reutilización debe ser autorizado por el autor.
 * @author Simón Bustamante Alzate <simonba97@hotmail.com> / Fecha: 26.10.2023 - Creado
 *
 * @export
 * @class MatchQuotasService
 */
export class MatchQuotasService {

    private _fileService: FileService;
    private _filePathInformation;

    /**
    * Crear una instancia de MatchQuotasService
    * @param {string} 
    * @memberof MatchQuotasService
    */
    public constructor(fileService: FileService) {
        /* Instancia de servicios */
        this._fileService = fileService;
        this._filePathInformation = Global.FILEPATH_MATCHQUOTAS;
    } // end constructor

    public async getAllMatchQuotas(): Promise<IMatchQuotasItem> {
        try {
            const matchQuotas: IMatchQuotasItem = await this._fileService.readFile(this._filePathInformation);
            return matchQuotas;
        } catch (error) {
            // Manejar errores si la lectura del archivo falla
            console.error('Error al obtener la de las cuotas del partido:', error);
            throw new Error('No se pudo obtener la información del partido.');
        }
    } // end getAllMatchQuotas


    /**
     * Busca una reserva por su chatId en las listas de jugadores de un partido.
     * @param {number} chatId - El chatId del jugador que se desea encontrar.
     * @returns {IPlayerInformationItem | undefined} - La información del jugador encontrado o undefined si no se encuentra.
     */
    public async getReservationByChatId(chatId: number): Promise<IPlayerInformationItem | undefined> {
        try {
            const matchQuotas: IMatchQuotasItem = await this.getAllMatchQuotas();

            const goalkeeper = matchQuotas.goalkeepers.find((player) => Number(player.chatId) === chatId);
            const player = matchQuotas.players.find((player) => Number(player.chatId) === chatId);
            const substitute = matchQuotas.substitutes.find((player) => Number(player.chatId) === chatId);

            return goalkeeper || player || substitute;
        } catch (error) {
            // Manejar errores si la lectura del archivo falla
            console.error('Error al obtener la reserva por ChatId:', error);
            throw new Error('No se pudo obtener la reserva por ChatId.');
        }
    } // end getReservationByChatId

    public async addReserve(messageData: any, positionPlayer: string): Promise<void> {
        try {
            const matchQuotas: IMatchQuotasItem = await this.getAllMatchQuotas();

            // Control para determinar si la reserva se realiza en la titular o suplencia
            const reservationAvailable = positionPlayer === Global.TYPE_GOALKEEPER
                ? matchQuotas.goalkeepers.length < 2
                : matchQuotas.players.length < 16;

            // Información del usuario para la reserva ya bien sea en la titular o suplencia
            const playerInformation: IPlayerInformationItem = {
                dateTimeReservation: format(new Date(), "dd/MM/yyyy HH:mm:ss"),
                fullName: `${messageData.chat.first_name} ${messageData.chat.last_name}`.replace(/[^\w\sáéíóúÁÉÍÓÚ]/gi, ''),
                pay: false,
                postion: positionPlayer.replace('typePlayer', '').toLowerCase(),
                chatId: messageData.chat.id
            };

            // Almacenamos la reserva en la titular o la suplencia
            if (reservationAvailable) {
                const targetArray = positionPlayer === Global.TYPE_GOALKEEPER
                    ? matchQuotas.goalkeepers
                    : matchQuotas.players;

                targetArray.push(playerInformation);
            } else {
                matchQuotas.substitutes.push(playerInformation);
            }

            // Guarda los datos en el archivo JSON
            await this._fileService.writeFile(this._filePathInformation, matchQuotas);
        } catch (error) {
            console.error('Error al obtener intentar agregar una reserva:', error);
            throw new Error('No se pudo obtener intentar agregar una reserva.');
        }
    } // end addReserve

    public async removeReserve(chatId: number): Promise<IPlayerInformationItem | undefined> {
        try {

            /* Consulta de datos necesarios */
            const matchQuotas: IMatchQuotasItem = await this.getAllMatchQuotas();
            let reservationPlayer = await this.getReservationByChatId(chatId);

            if (reservationPlayer) {
                reservationPlayer.dateTimeCancellation = format(new Date(), "dd/MM/yyyy HH:mm:ss");
            }

            /* Eliminamos la reserva de las Cuotas del Partido */
            matchQuotas.goalkeepers = matchQuotas.goalkeepers.filter((player) => player.chatId !== chatId);
            matchQuotas.players = matchQuotas.players.filter((player) => player.chatId !== chatId);
            matchQuotas.substitutes = matchQuotas.goalkeepers.filter((player) => player.chatId !== chatId);

            // Guarda los datos en el archivo JSON
            await this._fileService.writeFile(this._filePathInformation, matchQuotas);

            return reservationPlayer;
        } catch (error) {

        }
    } // end removeReserve
}