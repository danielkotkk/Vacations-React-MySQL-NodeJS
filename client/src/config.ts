export class Config {

    public static serverUrl: string;

    public static _initialize() {
        if (process.env.NODE_ENV === "production") {
            Config.serverUrl = "https://daniel-vacations.herokuapp.com";
        }
        else {
            Config.serverUrl = "http://localhost:3000";
        }
    }
}

Config._initialize();