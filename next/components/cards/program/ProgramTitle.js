import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import Link from 'next/link';
import ReactHtmlParser from 'react-html-parser';

function Title(props) {
    const { website, offerer, title, period } = props;
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const today = new Date();
        const [dd, mm, yyyy] = period.end.split(".");
        const endDate = new Date(`${yyyy}-${mm}-${dd}`);

        if (endDate < today) {
            setIsExpired(true);
        }
    }, [period]);


    return (
        <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
            <Link href={website} className="text-decoration-none">
                <Card.Title name="link">{ReactHtmlParser(offerer)} - {ReactHtmlParser(title)}</Card.Title>
            </Link>
            {period.start ?
                <>
                    {!isExpired ?
                        <Card.Title className="text-muted" name="link">
                            Period: {period.start} - {period.end}
                        </Card.Title>
                        :
                        <Card.Title className="text-muted" name="link">
                            Closed on {period.end}
                        </Card.Title>
                    }
                </>
                :
                <Card.Title className="text-muted" name="link">
                    Open
                </Card.Title>
            }
        </div>
    );
}

export default Title;
