// Integration tests: send real HTTP requests to the PHP API backed by MySQL.
// CI starts MySQL (seeded from schema.sql) and PHP's built-in server, then
// sets API_BASE. Node only runs the tests -- PHP serves the application.

const crypto = require("crypto");

const API_BASE = process.env.API_BASE;

function md5(text) {
	return crypto.createHash("md5").update(text).digest("hex");
}

async function post(endpoint, body) {
	const response = await fetch(`${API_BASE}/${endpoint}`, {
		method: "POST",
		headers: { "Content-Type": "application/json; charset=UTF-8" },
		body: JSON.stringify(body)
	});
	const text = await response.text();
	let json;
	try {
		json = JSON.parse(text);
	} catch {
		throw new Error(`${endpoint} did not return valid JSON:\n${text}`);
	}
	return { response, json };
}

beforeAll(() => {
	if (!API_BASE) {
		throw new Error("API_BASE is not set. These tests run in CI against PHP + MySQL (see .github/workflows/ci.yml).");
	}
});

describe("Login.php", () => {
	test("returns the user's id and name for valid credentials", async () => {
		const { response, json } = await post("Login.php", { login: "testuser", password: md5("testpass") });

		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toMatch(/application\/json/);
		expect(json).toEqual({ id: 1, firstName: "Test", lastName: "User", error: "" });
	});

	test("returns id 0 and an error for a wrong password", async () => {
		const { json } = await post("Login.php", { login: "testuser", password: md5("wrong") });

		expect(json).toEqual({ id: 0, firstName: "", lastName: "", error: "No Records Found" });
	});
});

describe("SearchColors.php", () => {
	test("returns matching colors as an array of strings", async () => {
		const { json } = await post("SearchColors.php", { search: "Blue", userId: 1 });

		expect(json.error).toBe("");
		expect(Array.isArray(json.results)).toBe(true);
		expect(json.results).toEqual(expect.arrayContaining(["Blue", "Light Blue"]));
		expect(json.results).not.toContain("Red");
	});

	test("returns an error and no results when nothing matches", async () => {
		const { json } = await post("SearchColors.php", { search: "zzz-no-such-color", userId: 1 });

		expect(json.error).toBe("No Records Found");
		expect(json.results).toBeUndefined();
	});

	test("only searches the requesting user's colors", async () => {
		const { json } = await post("SearchColors.php", { search: "Blue", userId: 999 });

		expect(json.error).toBe("No Records Found");
	});
});

describe("AddColor.php", () => {
	test("adds a color that SearchColors can then find", async () => {
		const color = `Test Color ${Date.now()}`;

		const added = await post("AddColor.php", { color, userId: 1 });
		expect(added.json).toEqual({ error: "" });

		const { json } = await post("SearchColors.php", { search: color, userId: 1 });
		expect(json.results).toEqual([color]);
	});
});
