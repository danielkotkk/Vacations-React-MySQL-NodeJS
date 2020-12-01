import React, { ChangeEvent } from 'react';
import "./admin-modal.css";
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import EditIcon from '@material-ui/icons/Edit';
import axios from "axios";
import { VacationsModel } from '../../../models/vacations-model';
import { getAxiosConfig } from '../../..';
import { Config } from '../../../config';
import { v4 as uuidv4 } from "uuid";
import Swal from 'sweetalert2';

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

export default function SimpleModal({ vacation }) {

    const classes = useStyles();
    const [modalStyle] = React.useState(getModalStyle);
    const [open, setOpen] = React.useState(false);

    let [destination, setDestinationState] = React.useState(vacation.destination);
    let [description, setDescriptionState] = React.useState(vacation.description);
    let [flightDate, setFlightDateState] = React.useState(new Date(vacation.flightDate));
    let [returnDate, setReturnDateState] = React.useState(new Date(vacation.returnDate));
    let [price, setPriceState] = React.useState(vacation.price);
    const [file, setFile] = React.useState<any>(undefined);
    let id = vacation.vacationId;

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
    const updateVacation = async () => {
        let vacationToUpdate: VacationsModel = {};

        vacationToUpdate.vacationId = id;

        if (destination === vacation.destination &&
            description === vacation.description &&
            flightDate === vacation.flightDate &&
            returnDate === vacation.returnDate &&
            price === vacation.price) {
            Swal.fire("Must change atleast one property");
            return;
        }
        if (destination !== vacation.destination) {
            if (destination.trim() === "") {
                Swal.fire("Not allowed empty destination!");
                return;
            }
            vacationToUpdate.destination = destination
        }
        if (description !== vacation.description) {
            if (description.trim() === "") {
                Swal.fire("Not allowed empty destination!");
                return;
            }
            vacationToUpdate.description = description;
        }
        if (flightDate !== vacation.flightDate)
            vacationToUpdate.flightDate = flightDate;
        if (returnDate !== vacation.returnDate)
            vacationToUpdate.returnDate = returnDate;
        if (price !== vacation.price)
            vacationToUpdate.price = price;

        let imageUuidToDelete = "";

        if (file) {
            imageUuidToDelete = vacation.picturePath;

            const data = new FormData();
            data.append("file", file);

            await axios.post(Config.serverUrl + "/api/vacations/upload-image/" + file.name, data, getAxiosConfig());
            await axios.delete(Config.serverUrl + "/api/vacations/delete-image/" + imageUuidToDelete, getAxiosConfig());
            vacationToUpdate.picturePath = file.name;
            setFile(undefined);
        }
        await axios.patch<VacationsModel>(Config.serverUrl + "/api/vacations/updateVacation/", vacationToUpdate, getAxiosConfig());
        handleClose();
    }
    const body = (
        <div style={modalStyle} className={classes.paper} id="modal">
            <h4 className="modalTitle" id="simple-modal-title">Editing Vacation  </h4>
            <hr />
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
            <hr />
            <div className="modalFooter">
                <button className="modalBtn modalBackBtn" onClick={handleClose}> Back </button>
                <button className="modalBtn modalConfirmBtn" onClick={updateVacation}> Confirm </button>
            </div>
        </div>
    );

    return (
        <div>
            <button type="button" className="editBtn" onClick={handleOpen}>
                <EditIcon />
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