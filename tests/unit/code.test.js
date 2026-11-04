/**
 * @jest-environment jsdom
 */

// Front-end unit tests: load the real public/js/code.js into a simulated
// browser (jsdom) with a fake XMLHttpRequest, so no server is needed.

const fs = require("fs");
const path = require("path");

const publicDir = path.join(__dirname, "..", "..", "public");
const colorPage = fs.readFileSync(path.join(publicDir, "color.html"), "utf8");
const indexPage = fs.readFileSync(path.join(publicDir, "index.html"), "utf8");

// Records every request code.js makes and lets a test play back a response
class FakeXHR {
	constructor() {
		FakeXHR.instances.push(this);
		this.headers = {};
	}
	open(method, url) {
		this.method = method;
		this.url = url;
	}
	setRequestHeader(name, value) {
		this.headers[name] = value;
	}
	send(body) {
		this.body = body;
	}
	respond(status, json) {
		this.readyState = 4;
		this.status = status;
		this.responseText = JSON.stringify(json);
		this.onreadystatechange.call(this);
	}
}
FakeXHR.instances = [];

function lastRequest() {
	return FakeXHR.instances[FakeXHR.instances.length - 1];
}

function showPage(html) {
	// Scripts set via innerHTML are not executed, so this only builds the DOM
	document.documentElement.innerHTML = html.replace(/<!DOCTYPE html>/i, "");
}

beforeAll(() => {
	window.XMLHttpRequest = FakeXHR;
	// Indirect eval runs the scripts in global scope, as a <script> tag would
	(0, eval)(fs.readFileSync(path.join(publicDir, "js", "md5.js"), "utf8"));
	(0, eval)(fs.readFileSync(path.join(publicDir, "js", "code.js"), "utf8"));
});

beforeEach(() => {
	FakeXHR.instances = [];
});

describe("validateColor", () => {
	test("accepts a normal color name", () => {
		expect(validateColor("Blue")).toBe("");
	});

	test("rejects an empty or whitespace-only name", () => {
		expect(validateColor("")).toBe("Please enter a color name");
		expect(validateColor("   ")).toBe("Please enter a color name");
	});

	test("rejects a missing value", () => {
		expect(validateColor(undefined)).toBe("Please enter a color name");
	});
});

describe("formatColorList", () => {
	test("joins results with line breaks", () => {
		expect(formatColorList(["Red", "Blue", "Green"])).toBe("Red<br />\r\nBlue<br />\r\nGreen");
	});

	test("returns a single color unchanged", () => {
		expect(formatColorList(["Red"])).toBe("Red");
	});

	test("returns an empty string when the API sends no results", () => {
		expect(formatColorList(undefined)).toBe("");
		expect(formatColorList([])).toBe("");
	});
});

describe("addColor", () => {
	beforeEach(() => showPage(colorPage));

	test("shows a validation message and sends no request for an empty color", () => {
		document.getElementById("colorText").value = "   ";
		addColor();

		expect(FakeXHR.instances).toHaveLength(0);
		expect(document.getElementById("colorAddResult").innerHTML).toBe("Please enter a color name");
	});

	test("posts the trimmed color as JSON to AddColor.php", () => {
		document.getElementById("colorText").value = "  Teal ";
		addColor();

		const xhr = lastRequest();
		expect(xhr.method).toBe("POST");
		expect(xhr.url).toMatch(/\/AddColor\.php$/);
		expect(JSON.parse(xhr.body)).toEqual({ color: "Teal", userId: expect.any(Number) });

		xhr.respond(200, { error: "" });
		expect(document.getElementById("colorAddResult").innerHTML).toBe("Color has been added");
	});
});

describe("searchColor", () => {
	beforeEach(() => showPage(colorPage));

	test("renders every returned color in the list", () => {
		document.getElementById("searchText").value = "bl";
		searchColor();

		const xhr = lastRequest();
		expect(xhr.url).toMatch(/\/SearchColors\.php$/);
		expect(JSON.parse(xhr.body).search).toBe("bl");

		xhr.respond(200, { results: ["Blue", "Black"], error: "" });
		expect(document.getElementById("colorList").innerHTML).toBe("Blue<br>\nBlack");
	});

	test("clears the list instead of crashing when nothing matches", () => {
		document.getElementById("colorList").innerHTML = "Old result";
		searchColor();

		expect(() => lastRequest().respond(200, { error: "No Records Found" })).not.toThrow();
		expect(document.getElementById("colorList").innerHTML).toBe("");
	});
});

describe("doLogin", () => {
	beforeEach(() => showPage(indexPage));

	test("sends the MD5 hash of the password, never the plain text", () => {
		document.getElementById("loginName").value = "testuser";
		document.getElementById("loginPassword").value = "testpass";
		doLogin();

		const payload = JSON.parse(lastRequest().body);
		expect(payload.login).toBe("testuser");
		expect(payload.password).toBe(md5("testpass"));
		expect(payload.password).not.toBe("testpass");
	});

	test("shows an error message for a wrong username or password", () => {
		doLogin();
		lastRequest().respond(200, { id: 0, firstName: "", lastName: "", error: "No Records Found" });

		expect(document.getElementById("loginResult").innerHTML).toBe("User/Password combination incorrect");
	});
});
