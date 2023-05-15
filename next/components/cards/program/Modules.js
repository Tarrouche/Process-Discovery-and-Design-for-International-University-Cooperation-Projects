import React from 'react';
import { Card, Table } from 'react-bootstrap';
import ReactHtmlParser from 'react-html-parser';
function AvailableModules({ modules }) {

    if (modules.state !== 'Available') {
        return (
            <Card.Text className="">
                There are no modules available for this program.
            </Card.Text>
        );
    }

    return (
        <>
            <Card.Text className="">
                There are modules available for this program, for which participants can apply to change their program parameters or add new ones. (Changing period, adding more benfits, etc...)
            </Card.Text>
            {modules.modules.length !== 0 && (
                <Table>
                    <thead>
                        <tr>
                            <th>Module Name</th>
                            <th className="text-center">Application Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {modules.modules.map((module, index) => (
                            <tr key={index} className="align-middle">
                                <td>{ReactHtmlParser(module.name)}</td>
                                <td className="text-center">{module.applicationTime}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </>
    );
}

export default AvailableModules;
