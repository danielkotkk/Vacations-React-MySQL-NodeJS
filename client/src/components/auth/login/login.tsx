import React, { Component, ChangeEvent } from "react";
import "./login.css"
import axios from "axios";
import { UserModel } from "../../../models/user-model";
import { NavLink } from "react-router-dom";
import UniversalCookie from "universal-cookie";
import SocketIO from "socket.io-client";
import { Config } from "../../../config";
import Swal from "sweetalert2";
interface LoginState {
    user: UserModel;
}
export class Login extends Component<any, LoginState>{
    private cookie = new UniversalCookie();
    public constructor(props: any) {
        super(props);
        this.state = {
            user: new UserModel(),
        }
    }


    private setUsername = (args: ChangeEvent<HTMLInputElement>) => {
        const user = { ...this.state.user };
        user.username = args.target.value;
        this.setState({ user });
    }
    private setPassword = (args: ChangeEvent<HTMLInputElement>) => {
        const user = { ...this.state.user };
        user.password = args.target.value;
        this.setState({ user });
    }

    private login = async () => {
        try {
            // Sending the info to the server side.
            const response = await axios.post(Config.serverUrl + "/api/auth/login", this.state.user);
            sessionStorage.setItem("token", response.data.token);
            const data = response.data;
            if (data.user.isAdmin === 1)
                sessionStorage.setItem("token2", response.data.token2);

            this.cookie.set("userFirstName", response.data.user.firstName);
            this.cookie.set("username", response.data.user.username);

            SocketIO.connect(Config.serverUrl);

            if (data.user.isAdmin === 0)
                this.props.history.push("./vacations");
            else
                this.props.history.push("./admin-page")

        }
        catch (err) {
            if (err.response.status === 400)
                Swal.fire("Invalid username or password!");
            else {
                alert(err.message);
            }
        }
    }
    public render() {
        return (
            <div className="login">
                {sessionStorage.getItem("token") && sessionStorage.getItem("token2") ? this.props.history.push("./admin-page") : sessionStorage.getItem("token") ? this.props.history.push("./vacations") :
                    <form>
                        <div className="login-wrap">
                            <div className="login-html">

                                <h3 className="authTitle">Login</h3>
                                <div className="login-form">
                                    <div className="sign-in-htm">
                                        <div className="group">
                                            <label className="label">Username</label>
                                            <input type="text" className="input" onChange={this.setUsername} value={this.state.user.username || ""} />
                                        </div>
                                        <div className="group">
                                            <label className="label">Password</label>
                                            <input type="password" className="input" onChange={this.setPassword} value={this.state.user.password || ""} />
                                        </div>
                                        <div className="group signInBtn">
                                            <button type="button" className="button" onClick={this.login}>Sign in</button>
                                        </div>
                                        <div className="loginHr"></div>
                                        <div className="foot-lnk">
                                            <NavLink to="/register">Don't have account? Register</NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </form>
                }
            </div>

        )
    }
}



