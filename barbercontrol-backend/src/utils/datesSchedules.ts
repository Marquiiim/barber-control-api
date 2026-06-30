export default class DateUtils {
    static getDaysOfCurrentMonth() {
        const today = new Date()
        const year = today.getFullYear()
        const month = today.getMonth()
        const currentDay = today.getDate()
        const lastDay = new Date(year, month + 1, 0).getDate()

        const days = []

        const startDay = currentDay === lastDay ? 1 : currentDay
        const startMonth = currentDay === lastDay ? month + 1 : month
        const startYear = currentDay === lastDay && month === 11 ? year + 1 : year

        const endMonth = startMonth
        const endYear = startYear
        const endLastDay = new Date(endYear, endMonth + 1, 0).getDate()

        for (let day = startDay; day <= endLastDay; day++) {
            const formattedFromDate = `${day.toString().padStart(2, '0')}/${(startMonth + 1).toString().padStart(2, '0')}/${startYear.toString()}`
            const formattedFromValue = `${startYear.toString()}-${(startMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`

            days.push({ formattedFromDate, formattedFromValue })
        }

        return days
    }
}