import React, { useState, useEffect } from 'react';
import moment from "moment";
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'react-bootstrap';
import DateInput from "../dashboard/programs/actions/set/manageFlow/DateInput";



function ProcessPeriodInput({ period, updPeriod, setPeriod }) {
    const [show, setShow] = useState(false);
    const [startDate, setStartDate] = useState({ name: 'Start', date: "" });
    const [endDate, setEndDate] = useState({ name: 'End', date: "" });

    const initializeDates = () => {
        setStartDate({ name: 'Start', date: updPeriod.start });
        setEndDate({ name: 'End', date: updPeriod.end });
    };

    useEffect(() => {
        initializeDates();
    }, []);

    const isValidDate = (dateString) => {
        return moment(dateString, "DD.MM.YYYY", true).isValid();
    };

    const isEndDateAfterStartDate = () => {
        return moment(endDate.date, "DD.MM.YYYY").isSameOrAfter(moment(startDate.date, "DD.MM.YYYY"));
    };

    const isFormValid = () => {
        if (isValidDate(startDate.date) && isValidDate(endDate.date) && isEndDateAfterStartDate()) {
            if (updPeriod.start !== startDate.date || updPeriod.end !== endDate.date) {
                setPeriod({
                    start: startDate.date, end: endDate.date
                });
            }
            return true;
        }
        return false;
    };

    const handleEditDates = (e) => {
        e.stopPropagation();
        setShow(!show);
    };

    return (
        <div>
            <div className="row">
                <div className="col">
                    {period && <h6 className="pt-3">{period}:</h6>}
                </div>
                <div className="col-3 text-center">
                    {isFormValid() &&
                        <Button onClick={handleEditDates} style={{ border: 'none', background: 'none', color: 'inherit' }}>
                            <FontAwesomeIcon icon={faEdit} />
                        </Button>
                    }
                </div>
            </div>
            {(!isFormValid() || show) &&
                <div className="row">

                    <DateInput
                        date={startDate}
                        setDate={setStartDate}
                        invalidText={'Please enter a valid date in the format dd.mm.yyyy.'}
                    />
                    <DateInput date={endDate}
                        after={startDate}
                        setDate={setEndDate}
                        invalidText={'Please enter a valid date in the format dd.mm.yyyy and make sure it is after the start date.'}
                    />




                </div>
            }
            <div className="form-group">
                <div className="row">
                    <div className="col">
                        <ul id="selectedDates">
                            {isFormValid() ? (
                                <>
                                    <li>Start date: {moment(startDate.date, "DD.MM.YYYY").format("MMMM Do, YYYY")}</li>
                                    <li>End date: {moment(endDate.date, "DD.MM.YYYY").format("MMMM Do, YYYY")}</li>
                                </>
                            ) : (
                                <li>Please enter valid dates to see the selection</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div >
    );
}

export default ProcessPeriodInput;