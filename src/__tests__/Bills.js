/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import router from "../app/Router.js"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains("active-icon")).toBe(true)

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  describe("When I click on the button “Nouvelle note de frais”", () => {
    test("Then it should navigate to NewBill page", () => {
      document.body.innerHTML = BillsUI({ data: [] })
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      const onNavigate = jest.fn()
      const store = null
      new Bills({ document, onNavigate, store, localStorage: window.localStorage })
      const buttonNewBill = screen.getByTestId('btn-new-bill')
      fireEvent.click(buttonNewBill)
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.NewBill)
    })
  })

  describe("When I click on an eye icon", () => {
    test("Then a modal should open with the bill proof", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      $.fn.modal = jest.fn()
      const onNavigate = jest.fn()
      const store = null
      new Bills({ document, onNavigate, store, localStorage: window.localStorage })
      const firstEyeIcon = screen.getAllByTestId('icon-eye')[0]
      fireEvent.click(firstEyeIcon)
      expect($.fn.modal).toHaveBeenCalled()
      const modalBody = document.querySelector('#modaleFile .modal-body').innerHTML
      expect(modalBody).toContain('<img')
    })
  })

  describe("When I fetch bills", () => {
    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: "a@a" }))
    })

    test("Then it should return formatted data", async () => {
      const onNavigate = jest.fn()
      const billsContainer = new Bills({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      const data = await billsContainer.getBills()
      expect(data.length).toBeGreaterThan(0)
      expect(data[0]).toMatchObject({
        date: expect.any(String),
        status: expect.any(String)
      })
    })

    test("Then it should fallback to raw data when format throws", async () => {
      const corruptedStore = {
        bills: () => ({
          list: () => Promise.resolve([{
            id: "1",
            date: "not-a-date",
            status: "pending",
            type: "Transports",
            name: "test",
            amount: 100,
            fileUrl: "https://test.com"
          }])
        })
      }
      const onNavigate = jest.fn()
      const billsContainer = new Bills({ document, onNavigate, store: corruptedStore, localStorage: window.localStorage })
      const data = await billsContainer.getBills()
      expect(data[0].date).toBe("not-a-date")
      expect(data[0].status).toBe("En attente")
    })
  })
})

describe("Given I am connected as an employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'a@a'
      }))
      document.body.innerHTML = ""
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      expect(screen.getByTestId("tbody")).toBeTruthy()
      expect(screen.getAllByTestId("icon-eye").length).toBeGreaterThan(0)
    })
  })

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'a@a'
      }))
      document.body.innerHTML = ""
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
    })

    afterEach(() => {
      mockStore.bills.mockRestore()
    })

    test("fetches bills and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => ({
        list: () => Promise.reject(new Error("Erreur 404"))
      }))
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick)
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches bills and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => ({
        list: () => Promise.reject(new Error("Erreur 500"))
      }))
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick)
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})
