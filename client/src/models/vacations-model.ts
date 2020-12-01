export class VacationsModel {
    public constructor(
        public vacationId?: number,
        public description?: string,
        public destination?: string,
        public picturePath?: string,
        public flightDate?: Date,
        public returnDate?: Date,
        public price?: number,
        public numOfFollowers?: number
    ) { }
}