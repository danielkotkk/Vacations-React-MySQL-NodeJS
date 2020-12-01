import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import "./followers-chart.css";
import { NavLink } from 'react-router-dom';
import { Config } from '../../../config';
import axios from "axios";
import { getAxiosConfig } from '../../..';

interface FollowersChartState {
    labels: [];
    numOfFollowers: [];
    data: {};
}
export class FollowersChart extends Component<any, FollowersChartState> {

    private labels = [];
    private numOfFollowers = [];
    private subtitles = "";
    private ref;

    public constructor(props: any) {
        super(props);
        this.state = {
            labels: [],
            numOfFollowers: [],
            data: {}
        }
    }

    async componentDidMount() {
        // Gets the number of followers of each vacation
        const followersResponse = await axios.get(Config.serverUrl + "/api/vacations/numOfFollowers", getAxiosConfig());
        const numOfFollowers = followersResponse.data;

        this.props.location.state.vacations.forEach(vacation => {
            for (let i = 0; i < this.props.location.state.vacations.length; i++)
                numOfFollowers[i] ? this.props.location.state.vacations[i].numOfFollowers = numOfFollowers[i].numOfFollowers : this.props.location.state.vacations[i].numOfFollowers = 0;
            this.labels.push(vacation.destination);
            this.numOfFollowers.push(vacation.numOfFollowers);
            if (vacation.numOfFollowers === 0) {
                this.subtitles += vacation.destination + ", ";
            }
        })
        if (this.subtitles !== "")
            this.subtitles = this.subtitles.substr(0, this.subtitles.length - 2);
        const data = {
            labels: this.labels,
            datasets: [
                {
                    label: 'Number of followers',
                    fill: false,
                    lineTension: 0.1,
                    backgroundColor: 'black',
                    borderColor: 'black',
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: 'rgba(75,192,192,1)',
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                    pointHoverBorderColor: 'rgba(220,220,220,1)',
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: this.numOfFollowers,
                }
            ]
        }
        this.setState({ data })
        this.ref = React.createRef();
    }

    render() {
        return (
            <div className="followersChart">

                <NavLink className="backLink" to="/admin-page"> &#129192; Back </NavLink>
                <h2 className="chartTitle">Followers Chart </h2>
                <h6 className="subtitles"> {this.subtitles !== "" ? "There Are No Followers For: " + this.subtitles : ""}</h6>
                <div className="chart">
                    <Bar ref={this.ref} data={this.state.data} />
                </div>
            </div>
        );
    }
};


