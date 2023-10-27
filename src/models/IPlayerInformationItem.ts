/**
 * Representa una estructura de:
 *
 * @export
 * @interface IPlayerInformationItem
 */
export interface IPlayerInformationItem {
    chatId: number,
    fullName: string,
    postion: string,
    dateTimeReservation: string,
    dateTimeCancellation?: string,
    pay: boolean,
} // end IPlayerInformationItem