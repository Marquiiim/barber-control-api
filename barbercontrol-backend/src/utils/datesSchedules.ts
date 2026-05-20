export default class DateUtils {
    static getDaysOfCurrentMonth(monthsAhead: number = 1) {
        const today = new Date()
        const year = today.getFullYear()
        const month = today.getMonth()
        const currentDay = today.getDate()
        const lastDay = new Date(year, month + 1, 0).getDate()

        const days = []

        for (let day = currentDay; day <= lastDay; day++) {
            const formattedDate = `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year.toString()}`

            days.push({ formattedDate })
        }

        return days
    }
}