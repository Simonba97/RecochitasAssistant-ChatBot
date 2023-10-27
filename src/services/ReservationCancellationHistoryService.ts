import { IInfoMatchItem } from "../models/IInfoMatchItem";
import { IPlayerInformationItem } from "../models/IPlayerInformationItem";
import { Global } from "../utils/Global";
import { FileService } from "./FileService";
import { InfoMatchService } from "./InfoMatchService";
import { parse, format } from 'date-fns';

/**
 * Servicio que contiene los metodos necesarios para gestionar un ReservationCancellationHistory
 * @copyright 2023 - El uso de esta libreria esta reservador para este sitio y cualquier cambio o reutilización debe ser autorizado por el autor.
 * @author Simón Bustamante Alzate <simonba97@hotmail.com> / Fecha: 26.10.2023 - Creado
 *
 * @export
 * @class ReservationCancellationHistoryService
 */
export class ReservationCancellationHistoryService {

    private _fileService: FileService;
    private _filePathInformation;
    /**
    * Crear una instancia de ReservationCancellationHistoryService
    * @param {string} 
    * @memberof ReservationCancellationHistoryService
    */
    public constructor(fileService: FileService) {
        /* Instancia de servicios */
        this._fileService = fileService;
        this._filePathInformation = Global.FILEPATH_CANCELLATIONHISTORY;
    } // end constructor

    /**
     * Obtiene la información de un partido desde un archivo.
     * @returns {Promise<IInfoMatchItem>} - Una promesa que se resuelve con la información del partido.
     */
    public async getReservationCancellationHistory(): Promise<any> {
        try {
            // Leemos la información del partido y esperamos la respuesta
            return await this._fileService.readFile(this._filePathInformation);
        } catch (error) {
            // Manejar errores si la lectura del archivo falla
            console.error('Error al obtener la información del historial de cancelaciones de reservas:', error);
            throw new Error('No se pudo obtener la información del historial de cancelaciones de reservas.');
        }
    } // end getReservationCancellationHistory

    public async addCancellation(reservationPlayer: IPlayerInformationItem | undefined): Promise<void> {
        try {
            /* Instancia de services */
            const infoMatchService: InfoMatchService = new InfoMatchService(this._fileService);

            /* Consulta de datos necesarios */
            const infoMatchData: IInfoMatchItem = await infoMatchService.getMatch();
            let cancellationHistory = await this.getReservationCancellationHistory();

            /* Calculamos el código del partido */
            let codeMatch = `match-${format(parse(infoMatchData.fullDate, 'dd/MM/yyyy HH:mm', new Date()), 'dd_MM_yyyy')}`;

            if (cancellationHistory[codeMatch]) {
                cancellationHistory[codeMatch].push(reservationPlayer)
            } else {
                cancellationHistory[codeMatch] = [reservationPlayer];
            }

            // Guarda los datos en el archivo JSON
            await this._fileService.writeFile(Global.FILEPATH_CANCELLATIONHISTORY, cancellationHistory);

        } catch (error) {

        }
    } // end addCancellation

}