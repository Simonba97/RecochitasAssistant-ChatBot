/**
 * Representa una estructura de:
 *
 * @export
 * @interface IPlayerInformationItem
 */
export interface IPlayerInformationItem {
    chatId: string,
    fullName: string,
    postion: 'Goalkeeper' | 'Defence' | 'Midfielder' | 'Forward',
    dateTimeReservation: string,
    pay: boolean,
} // end IPlayerInformationItem