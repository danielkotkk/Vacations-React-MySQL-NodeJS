import React, { Component } from "react";
import "./vacations.css";
import { VacationsModel } from "../../models/vacations-model";
import axios from "axios";
import { Col, Row, Container } from 'reactstrap';
import { UserModel } from "../../models/user-model";
import UniversalCookie from "universal-cookie";
import { socket, getAxiosConfig } from "../../index";
import { Config } from "../../config";
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { NavLink } from "react-router-dom";

interface VacationsState {
    organizedVacations: VacationsModel[];
    followedVacations: VacationsModel[];
    vacations: VacationsModel[];
    userFirstName: string;
    username: string;
    isFollowedVacation: boolean[];
}
export class Vacations extends Component<any, VacationsState> {
    private cookie = new UniversalCookie();
    public constructor(props: any) {
        super(props);

        this.state = {
            organizedVacations: [],
            followedVacations: [],
            vacations: [],
            userFirstName: "",
            username: "",
            isFollowedVacation: []
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
            const userFirstName = this.cookie.get("userFirstName");
            this.setState({ userFirstName });
            const username = this.cookie.get("username");
            this.setState({ username });

            const followedVacationsResponse = await axios.get(Config.serverUrl + `/api/vacations/getFollowedVacations/${username}`, getAxiosConfig())
            const followedVacations = followedVacationsResponse.data;
            this.setState({ followedVacations });

            const response = await axios.get<VacationsModel[]>(Config.serverUrl + "/api/vacations", getAxiosConfig());
            const vacations = response.data;

            const organizedVacations = [];
            const isFollowedVacation = [...this.state.isFollowedVacation];
            for (let i = 0; i < followedVacations.length; i++) {
                isFollowedVacation[i] = true;

                // Remove vacation from all the vacations because it exists already at followedVacations
                const indexOfVacationExists = vacations.findIndex(vacation => vacation.vacationId === followedVacations[i].vacationId);
                if (indexOfVacationExists > -1)
                    vacations.splice(indexOfVacationExists, 1); // Removes the followed vacation from all the other vacations
                organizedVacations.push(followedVacations[i]); // Add the followed vacation to the beggining
            }
            this.setState({ isFollowedVacation });
            vacations.forEach(vacation => organizedVacations.push(vacation));

            const followersResponse = await axios.get(Config.serverUrl + "/api/vacations/numOfFollowers", getAxiosConfig());
            const numOfFollowers = followersResponse.data;
            for (let i = 0; i < organizedVacations.length; i++)
                numOfFollowers[i] ? organizedVacations[i].numOfFollowers = numOfFollowers[i].numOfFollowers : organizedVacations[i].numOfFollowers = 0;

            this.setState({ organizedVacations });
            // Listening for changes.
            socket.on("updateVacations", async organizedVacations => {
                this.setState({ organizedVacations })
            });

            socket.on("updateFollowers", async allFollowers => {
                for (let i = 0; i < organizedVacations.length; i++) {
                    allFollowers[i] ? organizedVacations[i].numOfFollowers = allFollowers[i].numOfFollowers : organizedVacations[i].numOfFollowers = 0;
                    this.setState({ organizedVacations })
                }
            });

        }
        catch (err) {
            if (err.response.status === 401) {
                if (sessionStorage.getItem("token") || sessionStorage.getItem("token2")) {
                    sessionStorage.removeItem("token");
                    sessionStorage.removeItem("token2");
                    alert("Illegal try");
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
            else {
                alert(err.message);
            }
        }
    }

    private addFollower = async (vacationId, username, index) => {
        try {
            await axios.post(Config.serverUrl + "/api/vacations/addFollower", { vacationId: vacationId, username: username }, getAxiosConfig());
            const isFollowedVacation = [...this.state.isFollowedVacation];
            isFollowedVacation[index] = true;
            this.setState({ isFollowedVacation })
        }
        catch (err) {
            alert(err.message);
        }

    }
    private removeFollow = async (vacationId, username, index) => {
        try {
            await axios.delete(Config.serverUrl + `/api/vacations/removeFollow/${vacationId}/${username}`, getAxiosConfig());
            const isFollowedVacation = [...this.state.isFollowedVacation];
            isFollowedVacation[index] = false;
            this.setState({ isFollowedVacation })
        }
        catch (err) {
            alert(err.message);
        }
    }
    private logout = async () => {
        try {
            await axios.post<UserModel>(Config.serverUrl + "/api/auth/logout", getAxiosConfig());
            sessionStorage.removeItem("token");
            if (sessionStorage.getItem("token2"))
                sessionStorage.removeItem("token2");
            const username = "";
            this.cookie.remove("username");
            this.setState({ username });
            const userFirstName = "";
            this.cookie.remove("userFirstName");
            this.setState({ userFirstName });

            this.props.history.push("./login");
        }
        catch (err) {
            alert(err.message);
        }

    }
    public render() {
        return (
            <div className="vacations">
                {this.cookie.get("username") ?
                    <React.Fragment>
                        <div className="topDiv">
                            <div className="showUser"> Hello: {this.state.userFirstName} '{this.state.username}'
                                <button className="logoutBtn" onClick={this.logout}>
                                    <FontAwesomeIcon icon={faSignOutAlt} />
                                </button>
                            </div>
                            <NavLink className="aboutLink" to="./about">About Page &#8594;</NavLink>
                        </div>
                        <br />
                        <div className="title">
                            <hr className="titleHr" />
                            <h1 className="pageTitle"> Our Vacations: </h1>
                            <hr className="titleHr" />
                        </div>

                        <Container className="themed-container" fluid={true}>
                            <Row xs="2">
                                {this.state.organizedVacations.map((vacation, index) =>
                                    <Col key={vacation.vacationId}>
                                        <div className="property-card">

                                            <div className="property-image">
                                                <div className="property-image-title">
                                                    &#9998;
                                                    <img className="property-image" src={Config.serverUrl + `/api/vacations/get-one-image/${vacation.picturePath}`} alt="vacationImage" />
                                                </div>
                                            </div>
                                            <div className="property-description">
                                                <h5> {vacation.destination} </h5>
                                                <p>{vacation.description}</p>
                                                <div> Flight date: {new Date(vacation.flightDate).toLocaleDateString()}</div>
                                                <br />
                                                <div> Return date: {new Date(vacation.returnDate).toLocaleDateString()}</div>
                                                <p className="vacationUserPrice">Price: {vacation.price}&#8362;</p>
                                                <div className="numOfFollowers"> {vacation.numOfFollowers} </div>
                                                <button className="followBtn" onClick={() => this.state.isFollowedVacation[index] ? this.removeFollow(vacation.vacationId, this.state.username, index) : this.addFollower(vacation.vacationId, this.state.username, index)}> {this.state.isFollowedVacation[index] ? "Unfollow" : "Follow"} </button>
                                            </div>

                                            <div>
                                            </div>
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        </Container>
                    </React.Fragment> : this.props.history.push("./login")}

            </div >
        )
    }
}