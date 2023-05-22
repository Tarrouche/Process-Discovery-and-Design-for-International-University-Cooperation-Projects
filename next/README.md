# Front-end

This project requires certain modules to be installed, specific IP addresses to be updated, and a valid private key and certificate to run successfully. Please follow the instructions below to set up and run the project.

## Installation

1. Clone this repository to your local machine.
2. Navigate to the project's root directory.
3. Run the following command to install the required modules:

npm install

This will install all the dependencies listed in the `package.json` file.

## Configuration

1. Update IP Addresses:
- Open the `server.js` file located in the directory.
- Find the IP address placeholders and replace them with the appropriate IP addresses for your environment.
- The domain also must be updated

2. Private Key and Certificate:
- Replace the private key, certificate and intermediate certificate files paths in the same file with your valid private key and certificate files.

## Running the Project

Once you have installed the modules and updated the necessary configuration, you can start the project by running the following command:

npm run start-https


This command will start the project in HTTPS mode. Open your browser and visit `https://localhost` to access the application.

## Additional Notes

- Make sure you have Node.js and npm (Node Package Manager) installed on your machine before proceeding with the installation.

- For more information about the project and its features, please refer to the project paper.







