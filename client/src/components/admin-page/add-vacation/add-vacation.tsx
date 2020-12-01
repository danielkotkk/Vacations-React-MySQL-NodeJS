import React, { ChangeEvent } from 'react';
import "./add-vacation.css";
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import axios from "axios";
import { VacationsModel } from '../../../models/vacations-model';
import { getAxiosConfig } from '../../..';
import { Config } from '../../../config';
import { v4 as uuidv4 } from "uuid";
import Swal from "sweetalert2";
function getModalStyle() {
    const top = 10;
    const left = 0;
    const right = 0

    return {
        top: `${top}%`,
        left: `${left}%`,
        right: `${right}%`,
        margin: "auto"
    };
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paper: {
            position: 'absolute',
            width: 400,
            backgroundColor: theme.palette.background.paper,
            border: '2px solid #000',
            borderRadius: ".3rem",
            boxShadow: theme.shadows[5],
            padding: theme.spacing(2, 4, 3),
        },
    }),
);

export default function AddVacationModal() {
    const classes = useStyles();
    // State declaration
    const [modalStyle] = React.useState(getModalStyle);
    const [open, setOpen] = React.useState(false);

    let [destination, setDestinationState] = React.useState("");
    let [description, setDescriptionState] = React.useState("");
    let [flightDate, setFlightDateState] = React.useState(new Date());
    let [returnDate, setReturnDateState] = React.useState(new Date());
    let [price, setPriceState] = React.useState(0);
    const [file, setFile] = React.useState<any>();

    // Functions 
    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    const setDestination = (args: ChangeEvent<HTMLInputElement>) => {

        destination = args.target.value;
        setDestinationState(destination)
    }
    const setDescription = (args: ChangeEvent<HTMLTextAreaElement>) => {
        description = args.target.value;
        setDescriptionState(description)
    }
    const isOutdated = (dateSent: Date) => {
        const currentDate = new Date();
        if (dateSent.getFullYear() < currentDate.getFullYear())
            return true;

        if (dateSent.getFullYear() === currentDate.getFullYear() && dateSent.getMonth() < currentDate.getMonth())
            return true;

        if (dateSent.getFullYear() === currentDate.getFullYear() && dateSent.getMonth() === currentDate.getMonth() && dateSent.getDate() < currentDate.getDate())
            return true;

        return false;
    }
    const setFlightDate = (args: ChangeEvent<HTMLInputElement>) => {
        flightDate = new Date(args.target.value);

        if (isOutdated(flightDate))
            Swal.fire("Flight date can't be outdated!")
        else
            setFlightDateState(flightDate)
    }

    const setReturnDate = (args: ChangeEvent<HTMLInputElement>) => {
        returnDate = new Date(args.target.value);

        if (isOutdated(returnDate))
            Swal.fire("Return date can't be outdated!")
        else
            setReturnDateState(returnDate)
    }

    const setPrice = (args: ChangeEvent<HTMLInputElement>) => {
        price = +args.target.value;
        setPriceState(price)
    }

    const addVacation = async () => {
        const data = new FormData();
        data.append("file", file);

        let errors = ""; // Sum the errors.
        if (destination === "" || destination === " ")
            errors += "Destination, ";

        if (description === "" || description === " ")
            errors += "Description, "

        if (!file)
            errors += "Image, "

        if (errors.substr(errors.length - 2) === ", ") // To delete the comma.
            errors = errors.substr(0, errors.length - 2);

        if (errors === "") { // If there are no errors, add the vacation.
            let vacationToAdd = new VacationsModel(null, description, destination, file.name, flightDate, returnDate, price);
            await axios.post(Config.serverUrl + "/api/vacations/upload-image/" + file.name, data, getAxiosConfig())
            await axios.post<VacationsModel>(Config.serverUrl + "/api/vacations/addVacation", vacationToAdd, getAxiosConfig());
            // Makes all vacation details empty from the last vacation details.
            setDescriptionState("");
            setDestinationState("");
            setPriceState(0);
            handleClose();
        }
        else
            Swal.fire("Please Fill: " + errors);
    }
    const body = (
        <div style={modalStyle} className={classes.paper} id="modal">
            <h4 className="modalTitle" id="simple-modal-title">Add vacation  </h4>
            <hr />
            <form action="#">
                <p id="simple-modal-description" className="modalBody">
                    <label className="modalLabels"> Destination: </label>
                    <input className="modalInputs" type="text" onChange={setDestination} value={destination} /> <br />
                    <label className="modalLabels"> Description: </label>
                    <textarea className="modalInputs modalTextArea" onChange={setDescription} value={description}></textarea> <br />
                    <label className="modalLabels"> Flight date: </label>
                    <input className="modalInputs" type="date" onChange={setFlightDate} value={flightDate.toISOString().split("T")[0]} /> <br />
                    <label className="modalLabels"> Return date: </label>
                    <input className="modalInputs" type="date" onChange={setReturnDate} value={returnDate.toISOString().split("T")[0]} /> <br />
                    <label className="modalLabels" >Price: </label>
                    <input className="modalInputs" type="number" onChange={setPrice} value={price} /> <br />
                    <label className="modalLabels">Image: </label>
                    <input className="modalInputs" id="file" type="file" name="file" accept=".jpg" onChange={event => {
                        const file = event.target.files[0];
                        const extension = file.name.substr(file.name.lastIndexOf("."));
                        const lowerCaseExtension = extension.toLowerCase();
                        if (lowerCaseExtension !== ".jpg" && lowerCaseExtension !== ".png")
                            return "err";

                        Object.defineProperties(file, {
                            name: {
                                writable: true,
                                value: uuidv4() + extension
                            }
                        })
                        setFile(file);
                    }} />
                </p>
            </form>
            <hr />
            <div className="modalFooter">
                <button className="modalBtn modalBackBtn" onClick={handleClose}> Back </button>
                <button className="modalBtn modalConfirmBtn" onClick={addVacation}> Confirm </button>
            </div>
        </div>
    );

    return (
        <div>
            <button type="button" className="adminModalAndChartBtn" onClick={handleOpen}>
                Add vacation &#43;
            </button>
            <Modal
                open={open}
                onClose={handleClose}
            >
                {body}
            </Modal>
        </div>
    );
}