import React from 'react';

function Tags({ funded, transfer, eligiblePositions, applicationPeriod }) {
    return (
        <div key={`tags`} className='pt-2'>
            {funded.funded &&
                <span className="badge rounded-pill bg-primary custom-margin-right-5" >
                    Funded
                </span>
            }
            {['Possible', 'Required'].includes(transfer) &&
                <span className="badge rounded-pill bg-primary custom-margin-right-5" >
                    Transfer: {transfer}
                </span>
            }
            {Object.entries(eligiblePositions)
                .filter(([key, value]) => value)
                .map(([position, value], index, array) => (
                    <span className="badge rounded-pill bg-success custom-margin-right-5" key={`position-${position}`} >
                        {position}
                    </span>
                ))
            }
            <span className="badge rounded-pill bg-warning custom-margin-right-5" >
                {applicationPeriod.end ? applicationPeriod.end : funded.period.end}
            </span>
        </div>
    );
}

export default Tags;
