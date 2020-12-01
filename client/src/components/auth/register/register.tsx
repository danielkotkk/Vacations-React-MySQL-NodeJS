import React, { Component, ChangeEvent } from "react";
import "./register.css"
import { UserModel } from "../../../models/user-model";
import { NavLink } from "react-router-dom";
import UniversalCookie from "universal-cookie";
import axios from "axios";
import { Config } from "../../../config";
import Swal from "sweetalert2";

interface RegisterState {
    newUser: UserModel;
}
export class Register extends Component<any, RegisterState> {
    private cookie = new UniversalCookie();
    public constructor(props: any) {
        super(props);
        this.state = {
            newUser: new UserModel()
        }
    }

    private setUsername = (args: ChangeEvent<HTMLInputElement>) => {
        const newUser = { ...this.state.newUser };
        newUser.username = args.target.value;
        this.setState({ newUser });
    }

    private setPassword = (args: ChangeEvent<HTMLInputElement>) => {
        const newUser = { ...this.state.newUser };
        newUser.password = args.target.value;
        this.setState({ newUser });
    }
    private setFirstName = (args: ChangeEvent<HTMLInputElement>) => {
        const newUser = { ...this.state.newUser };
        newUser.firstName = args.target.value;
        this.setState({ newUser });
    }
    private setLastName = (args: ChangeEvent<HTMLInputElement>) => {
        const newUser = { ...this.state.newUser };
        newUser.lastName = args.target.value;
        this.setState({ newUser });

    }

    private register = async () => {
        try {
            let errors = "";
            // Errors checking
            if (!this.state.newUser.username || this.state.newUser.username === "" || this.state.newUser.username === " ")
                errors = "user name"
            if (!this.state.newUser.password || this.state.newUser.password === "" || this.state.newUser.password === " ")
                errors += errors === "" ? "password" : ",password";
            if (!this.state.newUser.firstName || this.state.newUser.firstName === "" || this.state.newUser.firstName === " ")
                errors += errors === "" ? "first name" : ",first name";
            if (!this.state.newUser.lastName || this.state.newUser.lastName === "" || this.state.newUser.lastName === " ")
                errors += errors === "" ? "last name" : ",last name";
            if (errors !== "")
                Swal.fire("Please fix the details: " + errors);
            else {
                // Sending the registeration info to the server side.
                const response = await axios.post(Config.serverUrl + "/api/auth/register", this.state.newUser);
                const data = response.data;

                // Token for if the user is logged in.
                sessionStorage.setItem("token", response.data.token);
                // Token for if the user is admin.
                if (data.isAdmin === 1) {
                    sessionStorage.setItem("token2", response.data.token2);
                }

                this.cookie.set("userFirstName", data.addedUser.firstName);
                this.cookie.set("username", data.addedUser.username);

                this.props.history.push("./vacations");
            }
        }
        catch (err) {
            if (err.response.status === 400)
                Swal.fire("Username already exists, Please choose another one.");
            else if (err.response.status === 401)
                Swal.fire("Username or password incorrect!");
            else
                alert(err.message);
        }
    }
    public render() {
        return (
            <div className="register">
                {sessionStorage.getItem("token") && sessionStorage.getItem("token2") ? this.props.history.push("./admin-page") : sessionStorage.getItem("token") ? this.props.history.push("./vacations") :
                    <form>
                        <div className="login-wrap registerPosition">
                            <div className="login-html registerContainerPadding">
                                <h3 className="authTitle registerTitle">Register</h3>
                                <div className="login-form">
                                    <div className="sign-up-htm">
                                        <div className="group">
                                            <label className="label">Username</label>
                                            <input type="text" className="input" onChange={this.setUsername} value={this.state.newUser.username || ""} />
                                        </div>
                                        <div className="group">
                                            <label className="label">Password</label>
                                            <input type="password" className="input" onChange={this.setPassword} value={this.state.newUser.password || ""} />
                                        </div>
                                        <div className="group">
                                            <label className="label">First name</label>
                                            <input type="text" className="input" onChange={this.setFirstName} value={this.state.newUser.firstName || ""} />
                                        </div>
                                        <div className="group">
                                            <label className="label">Last name</label>
                                            <input type="text" className="input" onChange={this.setLastName} value={this.state.newUser.lastName || ""} />
                                        </div>
                                        <div className="registerHr"></div>
                                        <div className="group signUpBtn">
                                            <button type="button" className="button" onClick={this.register}>Sign up</button>
                                        </div>
                                        <div className="linkToLoginPage">
                                            <NavLink to="/login">Already Member?</NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>}
            </div>
        )
    }
}