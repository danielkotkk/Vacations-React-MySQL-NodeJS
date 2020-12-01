import React, { Component } from "react";
import "./admin-page.css";
import { VacationsModel } from "../../models/vacations-model";
import axios from "axios";
import { Col, Row, Container } from 'reactstrap';
import UniversalCookie from "universal-cookie";
import { UserModel } from "../../models/user-model";
import SimpleModal from "./admin-modal/admin-modal";
import AddVacationModal from "./add-vacation/add-vacation";
import { socket, getAxiosConfig, isAdmin } from "../..";
import { NavLink } from "react-router-dom";
import { Config } from "../../config";
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Swal from "sweetalert2";

interface AdminPageState {
    userFirstName: string,
    username: string;
    vacations: VacationsModel[];
}

export class AdminPage extends Component<any, AdminPageState> {

    private cookie = new UniversalCookie();

    public constructor(props: any) {
        super(props);

        this.state = {
            vacations: [],
            userFirstName: "",
            username: "",
        }
    }
    componentWillUnmount() {
        // Fix Warning: Can't perform a React state update on an unmounted component. it will no longer hold any data in memory
        this.setState = () => {
            return;
        };
    }

    public async componentDidMount() {
        try {
            // To prevent from non admins to get to the page.
            axios.post("http://localhost:3000/api/auth/is-admin", "", isAdmin());
            const username = this.cookie.get("username");
            const userFirstName = this.cookie.get("userFirstName");

            this.setState({ userFirstName });
            this.setState({ username });
            // Gets all the vacations
            const response = await axios.get<VacationsModel[]>(Config.serverUrl + "/api/vacations", getAxiosConfig());
            const vacations = response.data;
            // Gets all the number of followers

            this.setState({ vacations });
            socket.on("updateVacations", vacations => {
                this.setState({ vacations })
            }
            );
        }
        catch (err) {
            if (err.response.status === 401) {
                // Prevent from adding random token/token2 at session storage, if illegal token, it will delete the token.
                if (sessionStorage.getItem("token") || sessionStorage.getItem("token2")) {
                    sessionStorage.removeItem("token");
                    sessionStorage.removeItem("token2");
                    this.cookie.remove("username");
                    this.cookie.remove("userFirstName");
                    alert("Illegal Operation");
                    this.props.history.push("./login")
                    return;
                }
                alert("Please login to access this path!");
                this.props.history.push("./login");
            }
            if (err.response.status === 403) {
                alert("Your current session expired, please log in again!");
                this.props.history.push("./login");
                sessionStorage.removeItem("user");
            }
        }
    }

    private logout = async () => {
        try {
            await axios.post<UserModel>(Config.serverUrl + "/api/auth/logout", getAxiosConfig());
            const username = "";
            this.cookie.remove("username");
            this.setState({ username });
            const userFirstName = "";
            this.cookie.remove("userFirstName");
            this.setState({ userFirstName });
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("token2");
            this.props.history.push("./login");
        }
        catch (err) {
            alert(err.message);
        }
    }
    private deleteVacation = async (vacationId, pictureUUID) => {
        try {
            await axios.delete(Config.serverUrl + `/api/vacations/deleteVacation/${vacationId}/${pictureUUID}`, getAxiosConfig());
            socket.on("updateVacations", vacations => this.setState({ vacations }));
        }
        catch (err) {
            Swal.fire(err.message);
        }
    }

    public render() {
        return (
            <div className="adminPage">
                {sessionStorage.getItem("token2") ?
                    <React.Fragment>
                        <div className="topDiv">

                            <div className="showUser"> Hello: {this.state.userFirstName} '{this.state.username}'
                                <button className="logoutBtn" onClick={this.logout}>
                                    <FontAwesomeIcon icon={faSignOutAlt} />
                                </button>
                                <br /><br />
                            </div>
                            <NavLink className="aboutLink" to="./about">About Page &#8594;</NavLink>

                        </div>
                        <br />
                        <div className="title">
                            <hr className="titleHr" />
                            <h1 className="pageTitle"> Admin interface </h1>
                            <hr className="titleHr" />
                        </div>


                        <div className="d-inline-block adminPageButtonsDiv">
                            <div className="d-inline-block"><AddVacationModal /></div>
                            <NavLink className="adminModalAndChartBtn chartBtn" to={{
                                pathname: '/followers-chart',
                                state: {
                                    vacations: this.state.vacations
                                }
                            }}> Followers chart</NavLink>
                        </div>

                        <Container className="themed-container" fluid={true}>
                            <Row>
                                {this.state.vacations.map((vacation) =>
                                    <Col key={vacation.vacationId}>
                                        <div className="property-card d-inline-block">

                                            <div className="property-image">
                                                <div className="property-image-title">
                                                    <img className="property-image" src={Config.serverUrl + "/api/vacations/get-one-image/" + vacation.picturePath} alt="vacationImage" />
                                                </div>
                                            </div>

                                            <div className="property-description vacationDetails">
                                                <SimpleModal vacation={vacation} />
                                                <br /><br />
                                                <button className="deleteBtn" onClick={() => this.deleteVacation(vacation.vacationId, vacation.picturePath)}>
                                                    &#88;
                                                </button>
                                                <h5 className="vacationDestination"> {vacation.destination} </h5>
                                                <p>{vacation.description}</p>
                                                <div className="vacationDetails"> Flight date: {new Date(vacation.flightDate).toLocaleDateString()}</div>
                                                <br />
                                                <div className="vacationDetails"> Return date: {new Date(vacation.returnDate).toLocaleDateString()}</div>
                                                <br />
                                                <p className="vacationPrice vacationDetails">Price: {vacation.price}&#8362;</p>
                                            </div>

                                            <div>
                                            </div>
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        </Container>
                    </React.Fragment>
                    : sessionStorage.getItem("token") ? this.props.history.push("./vacations") : this.props.history.push("./login")}
            </div>

        )
    }
}   
