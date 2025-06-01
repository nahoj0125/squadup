# Testplan för SquadUp

## Målbeskrivning

Målet med det här dokumentet är att skapa en överblick för SquadUp och dokumentera automatiska och manuella tester.

## Vad kommer att testas och hur?

Testningen kommer att bestå av

1. Manuella test fall för användarregistrering
2. Automatiska enhetstester med hjälp av jest

## Testmiljö

Testningen kommer att ske i de här miljöerna

- Utvecklingsmiljö: Lokal Node.js installation med MongoDB
- Testmiljö: SeparatMongoDB-testdatabas
- Webbläsare: Chrome och Firefox

## Automatiserade tester

Antal testsviter: 

## Manuell testning

| Test | UC1(Registrering) [Issue #17](https://github.com/nahoj0125/squadup/issues/17) |
|------|-------------------|
| TC1.1 |  |
| TC1.2 |  |
| TC1.3 |  |
| TC1.4 |  |
| TC1.5 |  |



| Test | UC2(Login) [Issue #22](https://github.com/nahoj0125/squadup/issues/22) |
|------|------|
| TC2.1 |  |
| TC2.2 |  |
| TC2.3 |  |
| TC2.4 |  |
| TC2.5 |  |

| Test |UC3(Skapa grupp) [Issue #27](https://github.com/nahoj0125/squadup/issues/27) |
|------|------|
| TC3.1 |  |
| TC3.2 |  |
| TC3.3 |  |
| TC3.4 |  |
| TC3.5 |  |

| Test |UC4(Inbjudning) [Issue #34](https://github.com/nahoj0125/squadup/issues/34)  |
|------|------|
| TC4.1 |  |
| TC4.2 |  |

| Test |UC5(Meddelande) [Issue #10](https://github.com/nahoj0125/squadup/issues/10)  |
|------|------|
| TC 5.1 |  |
| TC5.2 |  |
| TC5.3 |  |
| TC5.4 |  |
| TC5.5 |  |


| Test |UC6(Tillgänglighet) [Issue #2](https://github.com/nahoj0125/squadup/issues/2) [Issue #5](https://github.com/nahoj0125/squadup/issues/5) |
|------|------|
| TC6.1 |  |
| TC6.2 |  |
| TC6.3 |  |
| TC6.4 |  |
| TC6.5 |  |

| Test |UC7(Responsivitet) [Issue #70](https://github.com/nahoj0125/squadup/issues/70) |
|------|------|
| TC7.1 |  |

| Test |UC8(Kontoradering) [Issue #46](https://github.com/nahoj0125/squadup/issues/46) |
|------|------|
| TC8.1 |  |

| Test |UC9(Radering av grupp) [Issue #55](https://github.com/nahoj0125/squadup/issues/55) |
|------|------|
| TC9.1 |  |
| TC9.2 |  |

| Test |UC10(Hantering av inbjudan) [Issue #60](https://github.com/nahoj0125/squadup/issues/60) |
|------|------|
| TC10.1 |  |
| TC10.2 |  |

## UC1(Registrering)

### TC1.1 Registrera användaren

**Use case:** UC1 Registrering **Scenario:** Lyckad registrering med giltig information

Det huvudsakliga scenariot för UC1 testas där en lyckad registrering av en användare med giltig information.

**Förkrav**

- Systemet ska vara igång och registreringssidan tillgänglig
- Användaren får inte finnas i databasen

**Teststeg**

1. Navigera till registreringssidan
2. Fyll i användarnamn: "testuser"
3. Fyll i förnamn: "test"
4. Fyll i efternamn: "user"
5. Fyll i email: "testuser@examplemail.com"
6. Fyll i lösenordet: "password12345"
7. Fyll i bekräfta lösenord: "password12345"
8. Klicka på "Register"-knappen

**Förväntat resultat**

- Användaren blir registrerad i databasen
- Ett flashmeddelande visas "Registration successful! You can now log in."
- Användaren omdirigeras till startsidan

### TC1.2 Registrering av användare med olika lösenord

**Use case:** UC2 Registrering **Scenario:** Misslyckad registrering på grund av olikalösenord

**Förkrav**

- Systemet ska vara igång och registreringssidan tillgänglig

**Teststeg**

1. Navigera till registreringssidan
2. Fyll i användarnamn: "testuser123"
3. Fyll i förnamn: "test"
4. Fyll i efternamn: "user"
5. Fyll i email: "testuser123@examplemail.com"
6. Fyll i lösenordet: "password12345"
7. Fyll i bekräfta lösenord: "differentpassword"
8. Klicka på "Register"-knappen

**Förväntat resultat**

- Ett felmeddelande visas: "Passwords do not match"
- Användaren stannar kvar på registreringssidan

### TC1.3 Registrering av användare med befintligt användarnamn

**Use case:** UC1 Registrering **Scenario:** Registrering misslyckas på grund av befintligt användarnamn

**Förkrav**

- Systemet ska vara igång ocg registreringssidan tillgänglig
- En användare med användarnamnet "testuser"

**Testning**

1. Navigera till registreringssidan
2. Fyll i användarnamn: "testuser"
3. Fyll i förnamn: "existing"
4. Fyll i efternamn: "user"
5. Fyll i email: "existinguser@examplemail.com"
6. Fyll i lösenordet: "password12345"
7. Fyll i bekräfta lösenord: "password12345"
8. Klicka på "Register"-knappen

**Förvöntat resultat**

- Ett felmeddelandet visas "Username is already taken"
- Användaren stannar kvar på registreringssidan

### TC1.4 Registrera användare med befintlig e-postadress

**Use case:** UC1 Registrering **Scenario:** Registrering misslycka på grund av befintlig e-postadress

**Förkrav**

- Systemet ska vara igång ocg registreringssidan tillgänglig
- En användare med epostenadressen "testuser@examplemail.com" ska redan finnas i systemet

**Teststeg**

1. Navigera till registreringssidan
2. Fyll i användarnamn: "newusername"
3. Fyll i förnamn: "New"
4. Fyll i efternamn: "User"
5. Fyll i e-post: "testuser@examplemail.com"
6. Fyll i lösenord: "password1234"
7. Fyll i bekräfta lösenord: "password1234"
8. Klicka på "Register"-knappen

**Förväntat resultat**

- Ett felmeddelande visas: "Email is already taken"
- Användaren förblir på registreringssidan

### TC1.5 Registrera användare med ej godtagbart lösenord

**Use case:** UC1 Registrering **Scenario:** Registrering misslyckas på grund av för kort lösenord

**Förkrav**

- Systemet ska vara igång och registreringssidan tillgänglig

**Teststeg**

1. Navigera till registreringssidan
2. Fyll i användarnamn: "shortpwuser"
3. Fyll i förnamn: "Short"
4. Fyll i efternamn: "Password"
5. Fyll i e-post: "shortpw@example.com"
6. Fyll i lösenord: "short"
7. Fyll i bekräfta lösenord: "short"
8. Klicka på "Register"-knappen

**Förväntat resultat**

- Webbläsarvalideringen förhindrar att formuläret skickas.
- Valideringsmeddelande visas.

## UC2(Login)

### TC2.1 Lyckad inloggning

**Förkrav**

- Användare med användarnamnet "testuser" och lösenordet "password12345" finns i databasen.

**Teststeg**

1. Navigera till login sidan.
2. Skriv in användarnamnet "testuser".
3. Skriv in lösenordet "password12345".
4. Klicka på login.

**Förväntat resultat**

- Användaren blir autentiserad och vidareskickad till startsidan.

### TC2.2 Misslyckad inloggning med fel användarnamn

**Förkrav** -Det finns ingen användare i databasen med användarnamnet "nonexisting"

**Teststeg**

1. Navigera till login sidan.
2. Skriv in användarnamnet "nonexisting".
3. Skriv in lösenordet "12345678910"
4. Klicka på login.

**Förväntat resultat**

- Användaren får en 401 status tillbaka med meddalandet "401 Unauthorized Access is denied.".

### TC2.3 Misslyckad inloggning med fel lösenord

**Förkrav**

- Det finns en användare i databasen med användarnamnet "testuser" och lösenordet "password12345"

**Teststeg**

1. Navigera till login sidan.
2. Skriv in användarnamnet "testuser".
3. Skriv in lösenordet "wrongpassword"
4. Klicka på login.

**Förväntat resultat**

- Användaren får en 401 status tillbaka med meddalandet "401 Unauthorized Access is denied.".

### TC2.4 Tomt Formulär

**Förkrav**

**Teststeg**

1. Navigera till login sidan.
2. Lämna formuläret tomt.
3. Klicka på login.

**Förväntat resultat**

- Webbläsarvalideringen förhindrar att formuläret skickas.
- Valideringsmeddelande visas.

### TC2.5 Logout

**Förkrav**

- Användaren är inloggad

**Teststeg**

1. Klicka på logout

**Förväntat resultat**

- Användarsessionen förstörs.
- Användaren skickas till startsidan.

## UC3 (Skapa grupp)

### TC3.1 Åtkomst av gruppformulär

**Förkrav**

- Användaren är inloggad

**Teststeg**

1. Navigera till gruppsidan.
2. Klicka på "Create new Group".

**Förväntat resultat**

- Användaren blir skickad till gruppformuläret.

## TC3.2 Skapa en grupp

**Förkrav**

- Användaren är inloggad och är inne på gruppformuläret

**Teststeg**

1. Fyll i group name: "Study group"
2. Fyll i discription: "A group for studying together"
3. Klicka på "Create Group"

**Förväntat resultat**

- Användare blir skickad till gruppsidan
- Ett flashmeddelande visas "Group "Study group" created successfully!"
- Den skapade gruppen syns i listan bland grupper.

## TC3.3 Tomt formulär vid skapande av grupp

**Förkrav**

- Användaren är inloggad och är inne på gruppformuläret

**Teststeg**

1. Lämna "group name" fältet tomt
2. Fyll i discription: "A group without name"
3. Klicka på "Create Group"

**Förväntat resultat**

- Webbläsarvalideringen förhindrar att formuläret skickas.
- Valideringsmeddelande visas.

## TC3.4 För långt gruppnamn

**Förkrav**

- Användaren är inloggad och är inne på gruppformuläret

**Teststeg**

1. Skriv in ett långt gruppnamn(+100 tecken)
2. Skriv in discription: "Long group name"
3. Klicka på "Create Group"

**Förväntat resultat**

- Ett felmeddelande visas: "Group name cannot be longer than 100 charaters long"
- Användaren blir kvar på formulärsidan

## TC3.5 För lång gruppbeskrivning

**Förkrav**

- Användaren är inloggad och är inne på gruppformuläret

**Teststeg**

1. Skriv in "group name": "Group with long discription"
2. Skriv in en lång discription(+500 tecken)
3. Klicka på "Create Group"

**Förväntat resultat**

- Ett felmeddelande visas: "Description cannot be longer than 500 characters long "
- Användaren blir kvar på formulärsidan

## UC4(Inbjudning)

### TC4.1 Skicka inbjudning till en exsisterande användare

**Förkrav**

- Användaren är inloggad och är skaparen av gruppen som inbjudan skickas ifrån
- En grupp är skapad
- "testuser2" finns i databasen

**Teststeg**

1. Navigera till gruppsidan
2. Välj "Study group"
3. Klicka på "Invite User"
4. Fyll i "testuser2"
5. Klicka på "Send Invitation"

**Förväntat resultat**

- Ett flashmeddelande visas "Invitation sent to testuser2"
- Inbjudan skickas till testuser

### TC4.2 Skicka inbjudning till en icke exsisterande användare

**Förkrav**

- Användaren är inloggad och är skaparen av gruppen som inbjudan skickas ifrån
- En grupp är skapad
- Användarnamnet som blir inbjuden finns inte databasen

**Teststeg**

1. Navigera till gruppsidan
2. Välj "Study group"
3. Klicka på "Invite User"
4. Fyll i "nonexistinguser"
5. Klicka på "Send Invitation"

**Förväntat resultat**

- Ett felmeddelandet visas "User not found"

## UC5(Meddelanden)

### TC5.1 Skicka ett meddelande

**Förkrav**
- Användaren är inloggad
- Användaren är medlem i en grupp

**Teststeg**
1. Navigera till gruppsidan
2. Välj "Study group"
3. Hitta inputfältet för meddelanden
4. Skriv "Hello, this is a test message"
5. Klicka på "Send"-knappen

**Förväntat resultat**
- Meddelanden kommer upp i gruppens chatt
- Meddelandet visar avsändarens användarnamn
- Meddelandet visar tiden när meddelandet skickades
- Inputfältet tömms efter att meddelandet har skickats

### TC5.2 Skicka ett meddelande med specialtecken

**Förkrav**
- Användaren är inloggad
- Användaren är medlem i en grupp

**Teststeg**
1. Navigera till gruppsidan
2. Välj "Study group"
3. Hitta inputfältet för meddelanden
4. Skriv "Test with !@#$%^&*() and emoji 😊"
5. Klicka på "Send"-knappen

**Förväntat resultat**
- Meddelanden kommer upp i gruppens chatt med alla specialtecken och emojin
- Meddelandet visar avsändarens användarnamn
- Meddelandet visar tiden när meddelandet skickades
- Inputfältet tömms efter att meddelandet har skickats

### TC 5.3 Skicka ett tomt meddelande


**Förkrav**
- Användaren är inloggad
- Användaren är medlem i en grupp


**Teststeg**
1. Navigera till gruppsidan
2. Välj "Study group"
3. Hitta inputfältet för meddelanden
4. Lämna inputfältet tomt
5. Klicka på "Send"-knappen

**Förväntat resultat**
- Webbläsarvalideringen förhindrar att meddelandet skickas.
- Valideringsmeddelande visas.

### TC5.4 Meddelandevisning och hämtning

**Förkrav**
- Användaren är inloggad
- Användaren är medlem i en grupp med skickade meddelanden

**Teststeg**
1. Navigera till gruppsidan
2. Välj "Study group"
3. Observa meddelandehistoriken 

**Förväntat resultat**
- Meddelandena visas i kronologisk ordning med äldst sist
- Varje meddelande har en avsändare, tidsstämpel och innehåll


### TC5.5 Meddelandeverifiering över flera grupper

**Förkrav**
- Användaren är inloggad
- Användaren är medlem i två olika grupper ("Study group" och "Test group")

**Teststeg**
1. Navigera till gruppsidan
2. Välj "Study group"
3. Hitta inputfältet för meddelanden
4. Skriv "A message for Study group"
5. Klicka på "Back to groups"
6. Välj "Test group"
7. Hitta inputfältet för meddelanden
8. Skriv "A message Test group"

**Förväntat resultat**
- Meddelandena är isolerade i respektive grupper
- Inga korspostningar mellan grupper

## UC6(Tillgänglighet)

### TC6.1 Användaren lägger in sin tillgänglighet för första gången

**Förkrav**
- Användaren är inloggad
- Användaren är medlem i en grupp
- Användaren har inte lagt till sin tillgänglighet tidigare

**Teststeg*
1. Navigera till gruppsidan
2. Välj grupp "Study group"
3. Klicka på "Set My Availability"
4. Välj ledig tid: "Mon 9am-11am", "Wed 2pm-4pm" och "Fri 10am-12pm"
5. Klicka på "Save Availability"

*Förväntat resultat***
- Användaren skickas till gruppen sida
- Ett flashmeddelande visas "Your availability has been updated "
- Tillgängligheten skickas till databasen

### TC6.2 Användaren uppdaterar sin tillgänglighet

**Förkrav**
- Användaren är inloggad
- Användaren är medlem i en grupp
- Användaren har lagt till sin tillgänglighet tidigare

**Teststeg**
1. Navigera till gruppensidan
2. Välj gruppen "Study group"
3. Klicka på "View Common Availability"
4. Klicka på "Update My Availability"
5. Klicka ur "Mon 9am-10am"
6. Klicka på "Save Availability"

*Förväntat resultat***
- Användaren skickas till gruppen sida
- Ett flashmeddelande visas "Your availability has been updated "
- Tillgängligheten uppdateras och skickas till databasen

### TC6.3 Användaren tar bort sin tillgänglighet

**Förkrav**
- Användaren är inloggad
- Användaren är medlem i en grupp
- Användaren har lagt till sin tillgänglighet tidigare

**Teststeg**
1. Navigera till gruppensidan
2. Välj gruppen "Study group"
3. Klicka på "View Common Availability"
4. Klicka på "Clear All"
5. Klicka på "Save Availability"

*Förväntat resultat***
- Användaren skickas till gruppen sida
- Ett flashmeddelande visas "Your availability has been updated "
- Tillgängligheten för den veckan som visades tas bort


### TC6.4 Kontrollera tillgänglighet med flera medlemmar där inga tider är gemensamma

**Förkrav**
- Användaren är inloggad
- Användaren är medlem i en grupp men minst en annan medlem som har lagt till sin tillgänglighet

**Testsreg**
1. Navigera till gruppensidan
2. Välj gruppen som har tillgänglighet sparad
3. Klicka på "View Common Availability"
4. Notera den andra medlemmens tillgänglighet
5. Klicka på "Update My Availability"
6. Välj en tid som den andra medlemmen inte har lagt in
7. Klicka på "Save Availability"
8. Klicka på "View Common Availability"

**Förväntat resultat**
- Gemensam tillgänglighet syns markerad med antal personer som är tillgängliga
- Tillgängligheten uppdateras och skickas till databasen

### TC6.5 Kontrollera tillgänglighet med flera medlemmar som har gemensamma tider

**Förkrav**
- Användaren är inloggad
- Användaren är medlem i en grupp men minst en annan medlem som har lagt till sin tillgänglighet

**Teststeg**
1. Navigera till gruppensidan
2. Välj gruppen som har tillgänglighet sparad
3. Klicka på "View Common Availability"
4. Notera den andra medlemmens tillgänglighet
5. Klicka på "Update My Availability"
6. Välj en tid som den andra medlemmen har lagt in
7. Klicka på "Save Availability"
8. Klicka på "View Common Availability"

**Förväntat resultat**
- Gemensam tillgänglighet syns markerad med antal personer som är tillgängliga
- Tillgängligheten uppdateras och skickas till databasen


## UC7(Responsivitet)

### TC7.1 Se om sidan är responsiv
**Förkrav**
- Systemet ska vara igång

**Teststeg**
1. Öppna dev tools i webläsaren
2. Ändra storleken på vyn.

**Förväntat resultat**
- Layouten kommer att ändra beroende på storleken på vyn.

## UC8(kontoradering)

### TC8.1 Radera konto
**Förkrav**
- Användare med användarnamnet "testuser" och lösenordet "password12345" finns i databasen.

**Teststeg**

1. Navigera till login sidan.
2. Skriv in användarnamnet "testuser".
3. Skriv in lösenordet "password12345".
4. Klicka på login.
5. Klicka på "hello, testuser".
6. Fyll i "testuser".
7. Fyll i lösenordet "password12345".
8. Klicka "Ok".

**Förväntat resultat**
- Användaren meddelas att konto och all information har raderats.

## UC9(Radering av grupp)

### TC9.1 Lyckad radering grupp som skapare
**Förkrav**
- Användaren är inloggad.
- Användaren är skaparen av gruppen "Test Group".

**Teststeg**
1. Klicka på "Groups".
2. Klicka på "Test Group".
3. Klicka på "Delete Group".
4. Klicka på "Delete Group".

**Förväntat resultat**
Gruppen raderas med all information.
Användaren omdirigeras till gruppsidan.

### TC9.2 Misslyckad radering grupp som medlem
**Förkrav**
- Användaren är inloggad.
- Användaren är inte skaparen av gruppen "Test Group1".

**Teststeg**
1. Klicka på "Groups".
2. Klicka på "Test Group1".

**Förväntat resultat**
- Användaren får inte åtkomst åt raderingsformuläret.

## UC10(Hantering av inbjudan)

### TC10.1 Accepterad inbjudan
**Förkrav**
- Användaren är inloggad.
- Användaren har en inbjudan väntandes (pending).

**Teststeg**
1. Klicka på "Invitations".
2. Klicka på "Accept".

**Förväntat resultat**
- Ett meddelande visas om att inbjudan har accepterats.
- Användaren får medlemskap till gruppen.

### TC 10.1 Avslagen inbjudan
**Förkrav**
- Användaren är inloggad.
- Användaren har en inbjudan väntandes (pending).

**Teststeg**
1. Klicka på "Invitations".
2. Klicka på "Decline".

**Förväntat resultat**
- Ett meddelande visas om att inbjudan har avslagits.
- Användaren blir inte medlem i gruppen.