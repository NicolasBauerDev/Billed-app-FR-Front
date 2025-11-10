/**
 * @jest-environment jsdom
 */

import LoginUI from "../views/LoginUI";
import Login from "../containers/Login.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { fireEvent, screen, waitFor } from "@testing-library/dom";

describe("Given that I am a user on login page", () => {
  describe("When I do not fill fields and I click on employee button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("employee-email-input");
      expect(inputEmailUser.value).toBe("");

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      expect(inputPasswordUser.value).toBe("");

      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-employee")).toBeTruthy();
    });
  });

  describe("When I do fill fields in incorrect format and I click on employee button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      expect(inputEmailUser.value).toBe("pasunemail");

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-employee")).toBeTruthy();
    });
  });

  describe("When I do fill fields in correct format and I click on employee button Login In", () => {
    test("Then I should be identified as an Employee in app", () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        email: "johndoe@email.com",
        password: "azerty",
      };

      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password);

      const form = screen.getByTestId("form-employee");

      // localStorage should be populated with form data
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";

      const store = jest.fn();

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitEmployee);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Employee",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        })
      );
    });

    test("It should renders Bills page", () => {
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
    });

    describe("When the API login fails", () => {
      test("Then a new employee account is created and I am redirected", async () => {
        document.body.innerHTML = LoginUI();
        Object.defineProperty(window, "localStorage", {
          value: {
            getItem: jest.fn(() => null),
            setItem: jest.fn(() => null),
          },
          writable: true,
        });
        const onNavigate = jest.fn();
        const login = new Login({
          document,
          localStorage: window.localStorage,
          onNavigate,
          PREVIOUS_LOCATION: "",
          store: null,
        });
        const inputEmailUser = screen.getByTestId("employee-email-input");
        fireEvent.change(inputEmailUser, { target: { value: "employee@test.com" } });
        const inputPasswordUser = screen.getByTestId("employee-password-input");
        fireEvent.change(inputPasswordUser, { target: { value: "password" } });
        login.login = jest.fn(() => Promise.reject(new Error("API error")));
        login.createUser = jest.fn(() => Promise.resolve());
        const form = screen.getByTestId("form-employee");
        fireEvent.submit(form);
        await waitFor(() => expect(login.createUser).toHaveBeenCalled());
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Bills);
      });
    });
  });
});

describe("Given that I am a user on login page", () => {
  describe("When I do not fill fields and I click on admin button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("admin-email-input");
      expect(inputEmailUser.value).toBe("");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      expect(inputPasswordUser.value).toBe("");

      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
  });

  describe("When I do fill fields in incorrect format and I click on admin button Login In", () => {
    test("Then it should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      expect(inputEmailUser.value).toBe("pasunemail");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
  });

  describe("When I do fill fields in correct format and I click on admin button Login In", () => {
    test("Then I should be identified as an HR admin in app", () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        type: "Admin",
        email: "johndoe@email.com",
        password: "azerty",
        status: "connected",
      };

      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password);

      const form = screen.getByTestId("form-admin");

      // localStorage should be populated with form data
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";

      const store = jest.fn();

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitAdmin);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Admin",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        })
      );
    });

    test("It should renders HR dashboard page", () => {
      expect(screen.queryByText("Validations")).toBeTruthy();
    });

    describe("When the API login fails", () => {
      test("Then a new admin account is created and I am redirected", async () => {
        document.body.innerHTML = LoginUI();
        Object.defineProperty(window, "localStorage", {
          value: {
            getItem: jest.fn(() => null),
            setItem: jest.fn(() => null),
          },
          writable: true,
        });
        const onNavigate = jest.fn();
        const login = new Login({
          document,
          localStorage: window.localStorage,
          onNavigate,
          PREVIOUS_LOCATION: "",
          store: null,
        });
        const inputEmailUser = screen.getByTestId("admin-email-input");
        fireEvent.change(inputEmailUser, { target: { value: "admin@test.com" } });
        const inputPasswordUser = screen.getByTestId("admin-password-input");
        fireEvent.change(inputPasswordUser, { target: { value: "password" } });
        login.login = jest.fn(() => Promise.reject(new Error("API error")));
        login.createUser = jest.fn(() => Promise.resolve());
        const form = screen.getByTestId("form-admin");
        fireEvent.submit(form);
        await waitFor(() => expect(login.createUser).toHaveBeenCalled());
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Dashboard);
      });
    });
  });
});

describe("Given that the authentication store is available", () => {
  test("When I call login then the jwt is stored", async () => {
    document.body.innerHTML = LoginUI();
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
      },
      writable: true,
    });
    const store = {
      login: jest.fn(() => Promise.resolve({ jwt: "12345" })),
    };
    const login = new Login({
      document,
      localStorage: window.localStorage,
      onNavigate: jest.fn(),
      PREVIOUS_LOCATION: "",
      store,
    });
    const user = { email: "user@test.com", password: "pwd" };
    await login.login(user);
    expect(store.login).toHaveBeenCalledWith(JSON.stringify(user));
    expect(window.localStorage.setItem).toHaveBeenCalledWith("jwt", "12345");
  });

  test("When I call login without store then it returns null", () => {
    document.body.innerHTML = LoginUI();
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
      },
      writable: true,
    });
    const login = new Login({
      document,
      localStorage: window.localStorage,
      onNavigate: jest.fn(),
      PREVIOUS_LOCATION: "",
      store: null,
    });
    expect(login.login({ email: "no@store.com", password: "pwd" })).toBeNull();
  });
});

describe("Given that I need to create a user from the store", () => {
  test("When createUser succeeds then login is called afterwards", async () => {
    document.body.innerHTML = LoginUI();
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
      },
      writable: true,
    });
    const create = jest.fn(() => Promise.resolve());
    const store = {
      users: () => ({
        create,
      }),
    };
    const loginContainer = new Login({
      document,
      localStorage: window.localStorage,
      onNavigate: jest.fn(),
      PREVIOUS_LOCATION: "",
      store,
    });
    const loginSpy = jest.spyOn(loginContainer, "login").mockResolvedValue();
    const user = { type: "Employee", email: "new@test.com", password: "pwd" };
    await loginContainer.createUser(user);
    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      data: JSON.stringify({
        type: user.type,
        name: "new",
        email: user.email,
        password: user.password,
      }),
    }));
    expect(loginSpy).toHaveBeenCalledWith(user);
    loginSpy.mockRestore();
  });

  test("When there is no store then createUser returns null", () => {
    document.body.innerHTML = LoginUI();
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
      },
      writable: true,
    });
    const loginContainer = new Login({
      document,
      localStorage: window.localStorage,
      onNavigate: jest.fn(),
      PREVIOUS_LOCATION: "",
      store: null,
    });
    expect(loginContainer.createUser({ email: "no@store.com" })).toBeNull();
  });
});
