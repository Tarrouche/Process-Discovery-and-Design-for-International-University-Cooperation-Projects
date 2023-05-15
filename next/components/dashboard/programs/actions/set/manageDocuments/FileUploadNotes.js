import React from 'react';

function FileUploadNotes({ useLink }) {
    return (
        <div className='row'>
            <div className='col'>
                <h6 className='pt-3'>Notes for file upload usage:</h6>
                <ul className=''>
                    <li>Allowed extensions: [PDF, RTF]</li>

                    {useLink && (
                        <>
                            <li>Only HTTPS, HTTP and FTP links are accepted. (Still have to implement FTP in database)</li>
                            <li>Links must have the same domain as the program.</li>
                        </>
                    )}
                    <li>Make sure to upload new files before saving changes.</li>
                </ul>
            </div>
        </div>
    );
}

export default FileUploadNotes;
