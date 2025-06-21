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
Home Page
![squadup_homepage](https://github.com/user-attachments/assets/59544102-f0f3-4d9c-a25f-210a6026ff33)

Group Page
![squadup_group](https://github.com/user-attachments/assets/da18fd0a-10da-41c1-a578-cd9464213966)

Availability Page
![squadup_availability](https://github.com/user-attachments/assets/1f3f2a10-742d-4bca-8cd3-6e62c5b47990)

## Installation
Requirements
- Docker and Docker Compose
- Git
- Node.js (v18+ recommended)
- MongoDB (local or cloud)
- npm

1. Clone the repository:
```bash
git clone https://github.com/nahoj0125/squadup.git
cd squadup
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables
Copy .env.example to .env and fill in your MongoDB connection string and session secret.

4. Start the application:
```bash
docker-compose up --build
```

- The app will be available at http://localhost:3000 by default.

## Usage
- Register a new user account.
- Create or join a group.
- Set your availability in the group calendar.
- Send and receive messages within your group.
- Invite others to your group and manage membership.

# Testing

SquadUp includes comprehensive testing to ensure reliability and security.

### Automated Tests
```bash
# Run all tests
npm test
```

### Manual Tests
- [Manual Test Cases](docs/manual-tests.md)
- [Test Result](docs/test-result.md) 

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
* **Bug Reports & Issues**: Open an issue on [GitHub](https://github.com/nahoj0125/squadup/issues)
* **Documentation**: Check the README and code comments for implementation details

When reporting issues, please include your system details, steps to reproduce, and any error messages.

## Roadmap
Add real-time messaging (WebSockets)

## Contributing
Contributions are welcome! Please:

Fork the repository.
1. Create a new branch for your feature or bugfix.
2. Write clear, secure, and tested code.
3. Open a merge request with a description of your changes.

Run tests and lint before submitting:
```bash
npm test
npm run lint
```

## Project status
Active – SquadUp is under active development. Contributions and feedback are welcome!

# Test deployment
To test locally, follow the Installation steps and use the default environment variables.

## Authors and acknowledgment
[Johan Persson](https://github.com/nahoj0125) (nahoj0125)

## License
This project is licensed under the GNU General Public License v3.0.

## Academic Context
This project was developed as part of the course [1DV613](https://coursepress.lnu.se/kurser/mjukvaruutvecklingsprojekt/) during the first year of the  [Web Programming at Linnaeus University](https://lnu.se/program/webbprogrammerare/distans-ht/).
