# Colors (LAMP Stack Demo)

[![CI](https://github.com/richardmagiday-cell/Colors-vc/actions/workflows/ci.yml/badge.svg)](https://github.com/richardmagiday-cell/Colors-vc/actions/workflows/ci.yml)

A small full-stack web app built for the COP 4331 "COLORS Lab." A user logs
in, then can save colors to a personal list and search that list back. It
was built to practice a classic LAMP stack (Linux, Apache, MySQL, PHP) with
a plain HTML/CSS/JavaScript frontend talking to a PHP JSON API.

This README assumes you were not in the lab session and are seeing the
project for the first time.

## What the app does

- **Login page** (`public/index.html`) -- the user enters a username and
  password. The password is hashed client-side with MD5 before it is sent
  to the API, and the API compares it against the pre-hashed value stored
  in the `Users` table.
- **Colors page** (`public/color.html`), shown after a successful login --
  the user can:
  - add a new color to their personal list
  - search their existing colors by a substring match
  - log out (which clears the session cookie and returns to the login page)

Login state is kept in a short-lived (20 minute) browser cookie rather than
a server-side session.

## Technologies used

- **Frontend:** plain HTML, CSS, and vanilla JavaScript (`XMLHttpRequest`
  for API calls, no framework). Password hashing uses the third-party
  [`blueimp/JavaScript-MD5`](https://github.com/blueimp/JavaScript-MD5)
  library (MIT licensed, included in `public/js/md5.js`).
- **Backend:** PHP with the `mysqli` extension, using prepared statements
  for all queries.
- **Database:** MySQL (a `COP4331` database with `Users` and `Colors`
  tables).
- **Hosting:** a standard Apache + PHP + MySQL (LAMP) server.

## Project structure

```
Colors-vc/
  .github/workflows/ci.yml  GitHub Actions: lint, unit tests, integration tests
  api/                      PHP API (backend)
    Login.php
    AddColor.php
    SearchColors.php
    db_config.example.php   template for local DB credentials
  public/                   Frontend (served as static files)
    index.html               login page
    color.html                logged-in page (add/search colors)
    css/styles.css
    js/code.js                app logic, calls the API
    js/md5.js                 third-party MD5 library
    images/background.png
  tests/
    unit/code.test.js         front-end unit tests (Jest + jsdom)
    integration/api.test.js   API integration tests (Jest -> PHP -> MySQL)
    integration/schema.sql    test database schema and seed data
  docs/uml/                 use case, activity, and class diagrams
  package.json              lint/test tooling only (Node does not run the app)
  eslint.config.mjs, .stylelintrc.json, .htmlhintrc   linter configs
  .gitignore
  README.md
  LICENSE.md
```

## Database schema (expected)

The API expects a `COP4331` MySQL database with two tables:

- `Users` -- columns `ID`, `Login`, `Password` (MD5 hash), `FirstName`,
  `LastName`
- `Colors` -- columns `UserId`, `Name`

[`tests/integration/schema.sql`](tests/integration/schema.sql) creates
both tables and seeds a test user (`testuser` / `testpass`) with a few
colors. CI uses it for the integration tests, and you can load it into
your own MySQL server with `mysql -u <user> -p < tests/integration/schema.sql`.

## Setup instructions

1. **Database:** create the `COP4331` database and `Users`/`Colors` tables
   described above on a MySQL server, and create a MySQL user with access
   to it.
2. **API credentials:** in `api/`, copy `db_config.example.php` to
   `db_config.php` and fill in your real `$db_host`, `$db_user`,
   `$db_pass`, and `$db_name`. `db_config.php` is listed in `.gitignore`
   and is never committed -- this keeps real credentials out of the repo.
3. **Deploy the API:** place the `api/` folder on a PHP-enabled Apache
   server (it uses only `mysqli` and core PHP, no Composer dependencies).
4. **Point the frontend at the API:** `public/js/code.js` has a
   `urlBase` constant near the top of the file. Update it to the URL
   where you deployed the `api/` folder, e.g.:
   ```js
   const urlBase = 'http://your-domain.example/api';
   ```
5. **Deploy the frontend:** serve the `public/` folder as static files
   from Apache (or any static web server).

## How to run and access the app

- Open `public/index.html` in a browser (via the web server you deployed
  it to, not as a local `file://` path -- the API calls need to come from
  an http(s) origin).
- Log in with a username/password that exists in the `Users` table.
- On success you're redirected to `public/color.html`, where you can add
  and search colors.

## Linting, tests, and CI

Node.js is used only to install and run the linters and tests -- the app
itself runs on LAMP. After `npm install`:

| Command | What it does |
|---|---|
| `npm run lint` | HTMLHint, Stylelint, and ESLint over `public/` (and ESLint over `tests/`) |
| `npm test` | Front-end unit tests: loads the real `code.js` into jsdom with a fake `XMLHttpRequest` |
| `npm run test:integration` | Sends real HTTP requests to the PHP API; needs PHP, MySQL, and `API_BASE` set |

The integration tests need a running API, so they are normally run by CI
rather than locally. GitHub Actions ([`ci.yml`](.github/workflows/ci.yml))
runs on every push and pull request with three jobs:

1. **Lint** -- every linter runs even if an earlier one fails, so one run
   reports every problem.
2. **Unit tests** -- `npm run test:unit`.
3. **Integration tests** -- starts a MySQL 8 service container, loads
   `schema.sql`, writes a throwaway `db_config.php`, serves the repo with
   PHP's built-in server, and runs `npm run test:integration` against
   `http://127.0.0.1:8000/api`.

## Assumptions, limitations, and AI usage

- **Assumptions:** a MySQL database with the schema above already exists
  and is reachable from wherever `api/` is deployed; the `Users.Password`
  column stores MD5 hashes (matching what the frontend sends), not
  plaintext passwords.
- **Limitations:** this is a lab/teaching project, not production code.
  MD5 is not a secure password hashing algorithm for real applications
  (no salt, fast to brute-force) -- it was used here to match the lab's
  requirements. There is no CSRF protection, rate limiting, or input
  length/format validation beyond what's shown above, and the session
  cookie is not signed or encrypted.
- **AI usage:** this repository's organization into staged commits, the
  `README.md`/`LICENSE.md`, and the extraction of database credentials
  into a gitignored config file were done with the assistance of an AI
  coding assistant (Claude Code), per course policy on disclosing AI use.
  The application code itself (HTML/CSS/JS/PHP) was written for the
  COP 4331 COLORS Lab assignment. The CI work was also done with Claude
  Code: the GitHub Actions workflow, linter configs, and lint fixes
  (Assignment 4), and the Jest unit/integration tests, test schema, and
  the `validateColor`/`formatColorList` changes to `code.js` (Assignment 5).

## License

See [`LICENSE.md`](LICENSE.md).
