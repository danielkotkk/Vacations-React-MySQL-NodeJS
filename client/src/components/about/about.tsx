import React, { Component } from "react";
import "./about.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFacebook, faInstagram, faLinkedin } from "@fortawesome/free-brands-svg-icons"
import { NavLink } from "react-router-dom";
import axios from "axios";
import { getAxiosConfig } from "../..";
import UniversalCookie from "universal-cookie";
export class About extends Component<any> {
    private cookie = new UniversalCookie();
    public async componentDidMount() {
        try {
            await axios.post("http://localhost:3000/api/auth/is-logged-in", "", getAxiosConfig());
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
                    this.props.history.push("./login");
                    return;
                }
            }
        }
    }
    public render() {
        return (
            <div className="about">
                <div className="bg-light">
                    {sessionStorage.getItem("token") ? "" : this.props.history.push("./login")}
                    {sessionStorage.getItem("token2") ? <NavLink className="backLink aboutBack" to="/admin-page"> &#129192; Back </NavLink> : <NavLink className="backLink aboutBack" to="/vacations"> &#129192; Back </NavLink>}
                    <div className="container py-5">
                        <div className="row h-100 align-items-center py-5">
                            <div className="col-lg-6">
                                <h1 className="display-4 aboutPageTitle">About page</h1>


                            </div>
                            <div className="col-lg-6 d-none d-lg-block"><img src="https://res.cloudinary.com/mhmd/image/upload/v1556834136/illus_kftyh4.png" alt="" className="img-fluid" /></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white py-5">
                    <div className="container py-5">
                        <div className="row align-items-center mb-5">
                            <div className="col-lg-6 order-2 order-lg-1"><i className="fa fa-bar-chart fa-2x mb-3 text-primary"></i>
                                <h2 className="font-weight-light">About the project</h2>
                                <p className="font-italic text-muted mb-4">The project is about vacations following made as a solution for people who are looking for the best prices vacations.</p>
                            </div>
                            <div className="col-lg-5 px-5 mx-auto order-1 order-lg-2"><img src="https://res.cloudinary.com/mhmd/image/upload/v1556834139/img-1_e25nvh.jpg" alt="" className="img-fluid mb-4 mb-lg-0" /></div>
                        </div>

                    </div>
                </div>

                <div className="bg-light">
                    <div className="container">
                        <div className="row mb-4">
                            <div className="align-items-center col-12">
                                <h2 className="text-center display-4 font-weight-light aboutMeTitle">About me</h2>
                            </div>


                            <div className="row d-inline-block m-auto text-center">

                                <div className="col-12 mb-10">
                                    <div className="bg-white rounded shadow-sm px-4"><img src="/assets/images/myPic.jpg" alt="" width="60%" className="img-fluid rounded-circle mb-3 img-thumbnail shadow-sm" />
                                        <h5 className="mb-0">Daniel Kotlarov</h5><span className="small text-uppercase text-muted">Full Stack Web Developer</span>
                                        <ul className="social mb-0 list-inline mt-12">
                                            <li className="list-inline-item"><a href="https://www.facebook.com/daniel.kotlarov" className="social-link"><FontAwesomeIcon icon={faFacebook} /></a></li>
                                            <li className="list-inline-item"><a href="https://www.instagram.com/danielkot24/" className="social-link"><FontAwesomeIcon icon={faInstagram} /></a></li>
                                            <li className="list-inline-item"><a href="https://www.linkedin.com/in/daniel-kotlarov-400574182/" className="social-link"><FontAwesomeIcon icon={faLinkedin} /></a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <br />
                        </div>
                        <footer className="bg-light pb-5">
                            <div className="container text-center">
                                <p className="font-italic text-muted mb-0">&copy; Copyrights Daniel Kotlarov All rights reserved.</p>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        )
    }
}