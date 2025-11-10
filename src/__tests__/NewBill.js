/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

const setupNewBill = ({ create } = {}) => {
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
  const store = {
    bills: jest.fn(() => ({
      create: createMock,
    })),
  }
  const onNavigate = jest.fn()
  const newBill = new NewBill({
    document,
    onNavigate,
    store,
    localStorage: window.localStorage,
  })
  return { newBill, store, createMock }
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
})
