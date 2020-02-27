//@ts-check
import { DB } from "../firebase.js";

const START_TIME_STRING = '07:00:00';
const END_TIME_STRING = '15:00:00';

const HOLIDAYS = {
    // 2018
    1514757600000: "Uusaasta",
    1519423200000: "Eesti Vabariigi aastapäev",
    1522357200000: "Suur reede",
    1522530000000: "Ülestõusmispühade 1.püha",
    1525122000000: "Kevadpüha",
    1526763600000: "Nelipühade 1.püha",
    1529701200000: "Võidupüha",
    1529787600000: "Jaanipäev",
    1534712400000: "Taasiseseisvumispäev",
    1545602400000: "Jõululaupäev",
    1545688800000: "Esimene jõulupüha",
    1545775200000: "Teine jõulupüha",
    // 2020
    1577829600000: "Uusaasta", // 01.01
    1582495200000: "Eesti Vabariigi aastapäev", // 24.02
    1586466000000: "Suur reede", // 10.04
    1586638800000: "Ülestõusmispühade 1.püha", // 12.04
    1588280400000: "Kevadpüha", // 01.05
    1590872400000: "Nelipühade 1.püha", // 31.05
    1592859600000: "Võidupüha", //23.06
    1592946000000: "Jaanipäev", // 24.06
    1597870800000: "Taasiseseisvumispäev", // 20.08
    1608760800000: "Jõululaupäev", // 24.12
    1608847200000: "Esimene jõulupüha", // 25.12
    1608933600000: "Teine jõulupüha", // 26.12
    // 2021
    1609452000000: "Uusaasta", // 01.01
    1614117600000: "Eesti Vabariigi aastapäev", // 24.02
};

const isBeforeWorkDayEnd = time => {
    return new Date(time).toLocaleTimeString('et') < END_TIME_STRING;
}

const isHoliday = time => {
    return !!HOLIDAYS[new Date(time).setHours(0, 0, 0, 0)];
}

const isWeekend = time => {
    const weekday = new Date(time).getDay();
    return weekday === 6 || weekday === 0;
}

const isWorkHours = time => {
    const timeString = new Date(time).toLocaleTimeString('et');
    //console.log(timeString);
    return timeString > START_TIME_STRING && timeString <= END_TIME_STRING;
}
const getStartTime = (endTime, durationInHours) => {
    const fullWorkDays = Math.trunc(durationInHours / 8);
    const leftHours = durationInHours - fullWorkDays * 8;
    let previousTime = endTime;

    previousTime -= leftHours * 1000 * 60 * 60;
    if (!isWorkHours(previousTime)) {
        previousTime -= 16 * 1000 * 60 * 60;
    };
    if (isHoliday(previousTime) || isWeekend(previousTime)) {
        previousTime -= 1000 * 60 * 60 * 24;
    }
    if (isHoliday(previousTime) || isWeekend(previousTime)) {
        previousTime -= 1000 * 60 * 60 * 24;
    }
    if (isHoliday(previousTime) || isWeekend(previousTime)) {
        previousTime -= 1000 * 60 * 60 * 24;
    }
    if (isHoliday(previousTime) || isWeekend(previousTime)) {
        previousTime -= 1000 * 60 * 60 * 24;
    }
    if (isHoliday(previousTime) || isWeekend(previousTime)) {
        previousTime -= 1000 * 60 * 60 * 24;
    }
    for (let i = 0; i < fullWorkDays; i++) {
        previousTime -= 1000 * 60 * 60 * 24;
        if (isHoliday(previousTime) || isWeekend(previousTime)) {
            previousTime -= 1000 * 60 * 60 * 24;
        }
        if (isHoliday(previousTime) || isWeekend(previousTime)) {
            previousTime -= 1000 * 60 * 60 * 24;
        }
        if (isHoliday(previousTime) || isWeekend(previousTime)) {
            previousTime -= 1000 * 60 * 60 * 24;
        }
        if (isHoliday(previousTime) || isWeekend(previousTime)) {
            previousTime -= 1000 * 60 * 60 * 24;
        }
        if (isHoliday(previousTime) || isWeekend(previousTime)) {
            previousTime -= 1000 * 60 * 60 * 24;
        }
    }
    return previousTime;
}

const toEstLongDate = date => {
    let dateString = new Date(date).toLocaleDateString('et', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
    return dateString;
}

const toEstLongDateTime = date => {
    let dateString = new Date(date).toLocaleDateString('et', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    return dateString;
}

const utility = {
    HOLIDAYS: HOLIDAYS,
    isWeekend: isWeekend,
    isHoliday: isHoliday,
    getStartTime: getStartTime,
    toEstLongDate: toEstLongDate,
    toEstLongDateTime: toEstLongDateTime,
    isBeforeWorkDayEnd: isBeforeWorkDayEnd,
}

export { utility }