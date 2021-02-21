const { validateEmailPassUser } = require("./user.controller");

describe("Should test midelwares authorization", () => {
  it("Should test ...", () => {
    expect(validateEmailPassUser({ email: "qwe@qwe.we" }, (res = {}))).toBe(
      res.status(400).json({ message: "Error: email and password are required!" })
    );
  });
});
