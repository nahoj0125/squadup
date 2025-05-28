# squadup

## squadup
SquadUp is a collaborative web application for managing groups, scheduling, and messaging. It allows users to create groups, invite members, set and view availability, and communicate securely—all with robust security features.


## Description
SquadUp helps teams and groups coordinate by providing:

- Group creation and management
- Secure messaging within groups
- Availability scheduling and common time finding
- Invitation system for group membership
- Built with Node.js, Express, MongoDB, and EJS, SquadUp emphasizes security and privacy.

## Features
- User registration and authentication (with hashed passwords)
- CSRF protection on all sensitive routes
- Group creation, deletion, and membership management
- Messaging within groups
- Availability calendar and best-time suggestions
- Invitation system for joining groups
- Flash messages for user feedback
- Security headers via Helmet
- Session management with secure cookies

## Visuals
Depending on what you are making, it can be a good idea to include screenshots or even a video (you'll frequently see GIFs rather than actual videos). Tools like ttygif can help, but check out Asciinema for a more sophisticated method.

## Installation
Requirements
- Node.js (v18+ recommended)
- MongoDB (local or cloud)
- npm

1. Clone the repository:
git clone !!!
cd squadup

2. Install dependencies:
npm install

3. Set up environment variables

4. Start the application:
npm start

- The app will be available at http://localhost:3000 by default.

## Usage
- Register a new user account.
- Create or join a group.
- Set your availability in the group calendar.
- Send and receive messages within your group.
- Invite others to your group and manage membership.

## Security
SquadUp follows best practices for web application security:

CSRF Protection: All forms and sensitive routes are protected by CSRF tokens.
Session Security: Sessions use secure, HTTP-only cookies. Sessions are regenerated on login/logout.
Input Validation: All user input is validated and sanitized on both client and server.
Password Hashing: Passwords are hashed using bcrypt before storage.
Authorization: Only authorized users can perform sensitive actions (e.g., deleting groups, removing members).
Rate Limiting: (Recommended) Add rate limiting to authentication and sensitive endpoints.
Security Headers: Helmet is used to set HTTP security headers.

## Support
!!!

## Roadmap
Add real-time messaging (WebSockets)

## Contributing
Contributions are welcome! Please:

Fork the repository.
1. Create a new branch for your feature or bugfix.
2. Write clear, secure, and tested code.
3. Open a merge request with a description of your changes.

Run tests and lint before submitting:
npm test
npm run lint

## Authors and acknowledgment
Johan Persson (nahoj0125)

## License
This project is licensed under the GNU General Public License v3.0.

## Project status
Active – SquadUp is under active development. Contributions and feedback are welcome!

# Test deployment
To test locally, follow the Installation steps and use the default environment variables.
