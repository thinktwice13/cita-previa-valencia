import { formatAppointmentDate, formatAppointments } from './utils'

describe('locations date formatter', () => {
  it('correctly formats single date', () => {
    const d = '2006-06-03'
    const res = formatAppointmentDate(d)

    expect(res).toBe('Jun 3')
  })

  it('correctly formats date range', () => {
    const dates = ['2006-07-15', '2006-06-22', '2006-07-27']

    const res = formatAppointments(dates)
    expect(res).toBe('Available between Jun 22 and Jul 27')
  })
})
