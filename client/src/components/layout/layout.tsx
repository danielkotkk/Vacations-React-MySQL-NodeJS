import React, { Component } from "react";
import "./layout.css";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import { Login } from "../auth/login/login";
import { Register } from "../auth/register/register";
import { Vacations } from "../vacations/vacations";
import { AdminPage } from "../admin-page/admin-page";
import { FollowersChart } from "../admin-page/followers-chart/followers-chart";
import { About } from "../about/about";

export class Layout extends Component {

    public render() {
        return (
            <div className="layout">
                <BrowserRouter>
                    <Switch>
                        <Route path="/login" component={Login} exact />
                        <Route path="/register" component={Register} exact />
                        <Route path="/about" component={About} exact />
                        <Route path="/vacations" component={Vacations} exact />
                        <Route path="/admin-page" component={AdminPage} exact />
                        <Route path="/followers-chart" component={FollowersChart} exact />
                        <Redirect from="/" to="/login" />
                    </Switch>
                </BrowserRouter>
            </div>
        )
    }
}