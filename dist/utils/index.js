"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mostPopular = exports.calculateDateRange = exports.sum = void 0;
const sum = (arr) => {
    return arr.reduce((acc, cur) => {
        acc.amountPaid += cur.paid;
        acc.amountUnPaid += cur.unPaid;
        acc.balance += cur.total;
        return acc;
    }, { amountPaid: 0, amountUnPaid: 0, balance: 0 });
};
exports.sum = sum;
const calculateDateRange = (filter) => {
    const today = new Date();
    if (filter === 'weekly') {
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);
        return { $gte: oneWeekAgo, $lte: endOfToday };
    }
    if (filter === 'monthly') {
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        return { $gte: firstDayOfMonth, $lte: lastDayOfMonth };
    }
    return null;
};
exports.calculateDateRange = calculateDateRange;
const mostPopular = (arr) => {
    const petInfo = arr.reduce((acc, cur) => {
        acc[cur.patient.petType].count += 1;
        acc[cur.patient.petType].checkUpFee = cur.total;
        return acc;
    }, {
        cat: { count: 0, checkUpFee: 0 || 1200 },
        dog: { count: 0, checkUpFee: 0 || 1000 },
        bird: { count: 0, checkUpFee: 0 || 700 },
    });
    const popular = Object.keys(petInfo).reduce((a, b) => petInfo[a].count > petInfo[b].count ? a : b);
    const petCharges = Object.keys(petInfo).reduce((acc, pet) => {
        acc[pet] = petInfo[pet].checkUpFee;
        return acc;
    }, {});
    return { popular, petCharges };
};
exports.mostPopular = mostPopular;
