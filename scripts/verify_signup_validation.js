const http = require("http");

const postData = (data) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: "localhost",
            port: 3000,
            path: "/api/auth/signup",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            timeout: 2000,
        };

        const req = http.request(options, (res) => {
            let body = "";
            res.on("data", (chunk) => (body += chunk));
            res.on("end", () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, body: body });
                }
            });
        });

        req.on("error", (e) => reject(e));
        req.on("timeout", () => {
            req.destroy();
            reject(new Error("Request timed out. Is the server running?"));
        });

        req.write(JSON.stringify(data));
        req.end();
    });
};

async function runTests() {
    console.log("Starting verification tests...");
    console.log("Ensure your Next.js server is running on port 3000");

    // Test 1: Invalid Email Format
    try {
        console.log("Test 1: Sending invalid email...");
        const res1 = await postData({
            name: "Test User",
            email: "invalid-email",
            password: "password123",
        });
        console.log(
            "Test 1 Result:",
            res1.status === 400 && res1.body.error === "รูปแบบอีเมลไม่ถูกต้อง"
                ? "PASS"
                : "FAIL",
            res1
        );
    } catch (e) {
        console.error("Test 1 Error:", e.message);
    }

    // Test 2: Email with spaces
    try {
        console.log("Test 2: Sending email with spaces...");
        const res2 = await postData({
            name: "  Test User  ",
            email: "  test_space@example.com  ",
            password: "password123",
        });
        const passedValidation = res2.status === 201 || res2.status === 409;
        console.log("Test 2 Result:", passedValidation ? "PASS" : "FAIL", res2);
    } catch (e) {
        console.error("Test 2 Error:", e.message);
    }

    // Test 3: Empty Email
    try {
        console.log("Test 3: Sending empty email...");
        const res3 = await postData({
            name: "Test User",
            email: "",
            password: "password123",
        });
        console.log(
            "Test 3 Result:",
            res3.status === 400 ? "PASS" : "FAIL",
            res3
        );
    } catch (e) {
        console.error("Test 3 Error:", e.message);
    }
}

runTests();
