const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const formatAppointmentDate = (d: string): string => {
  const day = parseInt(d.slice(8))
  const date = new Date(parseInt(d.slice(0, 4)), parseInt(d.slice(5, 7)) - 1, day)
  const month = date.toLocaleString('default', { month: 'short' })
  return `${month} ${day.toString()}`
}

export const formatAppointments = (appointments?: string[]): string => {
  if (!appointments) return ''

  if (appointments.length == 1) {
    return `Available on ${formatAppointmentDate(appointments[0])}`
  }

  appointments.sort(function (a, b) {
    return ('' + a).localeCompare(b)
  })
  const first = formatAppointmentDate(appointments[0])
  const last = formatAppointmentDate(appointments[appointments.length - 1])
  return `Available between ${first} and ${last}`
}
