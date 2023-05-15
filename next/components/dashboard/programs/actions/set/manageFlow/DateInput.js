import React from "react";
import moment from "moment";
import { Form } from 'react-bootstrap';



function DateInput({ date, setDate, invalidText, after }) {

    const handleDateChange = (e) => {
        setDate({ ...date, date: e.target.value });
    };

    const isValidDate = (dateString) => {
        if (after) {
            return moment(date.date, "DD.MM.YYYY").isSameOrAfter(moment(after.date, "DD.MM.YYYY"));
        }
        return moment(dateString, "DD.MM.YYYY", true).isValid();
    };


    return (
        <Form.Group controlId={date.name} className="col">
            <Form.Label>{date.name} Date:</Form.Label>
            <Form.Control
                type="text"
                placeholder="dd.mm.yyyy"
                value={date.date}
                onChange={handleDateChange}
                isValid={isValidDate(date.date)}
                isInvalid={!isValidDate(date.date)}
            />
            <Form.Control.Feedback type="invalid">
                {invalidText}
            </Form.Control.Feedback>
        </Form.Group>


    );
}

export default DateInput;
