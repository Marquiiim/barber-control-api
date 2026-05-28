export default class DateUtils {
    static getDaysOfCurrentMonth() {
        const today = new Date()
        const year = today.getFullYear()
        const month = today.getMonth()
        const currentDay = today.getDate()
        const lastDay = new Date(year, month + 1, 0).getDate()

        const days = []

        for (let day = currentDay; day <= lastDay; day++) {
            const formattedFromDate = `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year.toString()}`
            const formattedFromValue = `${year.toString()}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`

            days.push({ formattedFromDate, formattedFromValue })
        }

        return days
    }
}