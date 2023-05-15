import React from 'react';
import { Card } from 'react-bootstrap';
import Link from 'next/link';


function CallsAvailable({ calls }) {

    if (['Available', 'Required'].includes(calls.state)) {
        return (
            <Card.Text className="">
                There are calls available for this program,&nbsp;
                {calls.state === 'Required'
                    ? 'using them for application is mandatory.'
                    : 'using them for application isn\'t mandatory.'
                }
                &nbsp;
                (<Link href={calls.source} className="text-decoration-none">source</Link>)
            </Card.Text>

        );
    }

    return (
        <Card.Text className="">
            There are no calls available for this program.
        </Card.Text>
    );
}

export default CallsAvailable;
