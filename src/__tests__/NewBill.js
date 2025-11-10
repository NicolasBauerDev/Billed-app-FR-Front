/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH } from "../constants/routes.js"
import mockStore from "../__mocks__/store"

const setupNewBill = ({ create, update } = {}) => {
  document.body.innerHTML = NewBillUI()
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: jest.fn(() => JSON.stringify({ email: "employee@test.tld" })),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  })
  const createMock = create || jest.fn().mockResolvedValue({ fileUrl: "https://localhost/test.png", key: "1234" })
  const updateMock = update || jest.fn().mockResolvedValue({})
  const store = {
    bills: jest.fn(() => ({
      create: createMock,
      update: updateMock,
    })),
  }
  const onNavigate = jest.fn()
  const newBill = new NewBill({
    document,
    onNavigate,
    store,
    localStorage: window.localStorage,
  })
  return { newBill, store, createMock, onNavigate }
}

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page and upload a valid file", () => {
    test("Then the file is sent to the store", async () => {
      const { createMock, newBill } = setupNewBill()
      const fileInput = screen.getByTestId("file")
      const validFile = new File(["file"], "justificatif.png", { type: "image/png" })

      fireEvent.change(fileInput, { target: { files: [validFile] } })

      await waitFor(() => expect(createMock).toHaveBeenCalled())
      expect(newBill.fileName).toBe("justificatif.png")
    })
  })

  describe("When I am on NewBill Page and upload an invalid file", () => {
    test("Then the upload is rejected", () => {
      const create = jest.fn()
      const { createMock, newBill } = setupNewBill({ create })
      const fileInput = screen.getByTestId("file")
      const invalidFile = new File(["file"], "justificatif.pdf", { type: "application/pdf" })

      fireEvent.change(fileInput, { target: { files: [invalidFile] } })

      expect(createMock).not.toHaveBeenCalled()
      expect(fileInput.value).toBe("")
      expect(newBill.fileName).toBeNull()
      expect(newBill.fileUrl).toBeNull()
    })
  })

  describe("When I submit a valid form", () => {
    test("Then updateBill is called and I navigate to Bills page", () => {
      const { newBill, onNavigate } = setupNewBill()
      const form = screen.getByTestId("form-new-bill")
      fireEvent.change(screen.getByTestId("expense-type"), { target: { value: "Transports" } })
      fireEvent.change(screen.getByTestId("expense-name"), { target: { value: "Un trajet" } })
      fireEvent.change(screen.getByTestId("datepicker"), { target: { value: "2023-01-10" } })
      fireEvent.change(screen.getByTestId("amount"), { target: { value: "200" } })
      fireEvent.change(screen.getByTestId("vat"), { target: { value: "40" } })
      fireEvent.change(screen.getByTestId("pct"), { target: { value: "30" } })
      fireEvent.change(screen.getByTestId("commentary"), { target: { value: "Note de frais" } })
      newBill.fileUrl = "https://localhost/test.png"
      newBill.fileName = "test.png"
      const updateBillSpy = jest.spyOn(newBill, "updateBill")

      fireEvent.submit(form)

      expect(updateBillSpy).toHaveBeenCalledWith(expect.objectContaining({
        type: "Transports",
        name: "Un trajet",
        amount: 200,
        date: "2023-01-10",
        vat: "40",
        pct: 30,
        commentary: "Note de frais",
        fileUrl: "https://localhost/test.png",
        status: "pending"
      }))
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Bills)
      updateBillSpy.mockRestore()
    })
  })
})

describe("Given I am connected as an employee and submit a new bill", () => {
  test("Then it posts the bill to the mock API and navigates to Bills", async () => {
    document.body.innerHTML = NewBillUI()
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => JSON.stringify({ email: "employee@test.tld" })),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    })
    const onNavigate = jest.fn()
    const newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    })
    const storeBills = mockStore.bills()
    const createSpy = jest.spyOn(storeBills, "create")
    const updateSpy = jest.spyOn(storeBills, "update")

    const fileInput = screen.getByTestId("file")
    const validFile = new File(["file"], "integration.png", { type: "image/png" })
    fireEvent.change(fileInput, { target: { files: [validFile] } })
    await waitFor(() => expect(createSpy).toHaveBeenCalled())

    fireEvent.change(screen.getByTestId("expense-type"), { target: { value: "Transports" } })
    fireEvent.change(screen.getByTestId("expense-name"), { target: { value: "Intégration" } })
    fireEvent.change(screen.getByTestId("datepicker"), { target: { value: "2023-02-15" } })
    fireEvent.change(screen.getByTestId("amount"), { target: { value: "350" } })
    fireEvent.change(screen.getByTestId("vat"), { target: { value: "70" } })
    fireEvent.change(screen.getByTestId("pct"), { target: { value: "20" } })
    fireEvent.change(screen.getByTestId("commentary"), { target: { value: "Test intégration" } })

    const form = screen.getByTestId("form-new-bill")
    fireEvent.submit(form)

    await waitFor(() => expect(updateSpy).toHaveBeenCalled())
    expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Bills)
    createSpy.mockRestore()
    updateSpy.mockRestore()
  })
})
