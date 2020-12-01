const dal = require("../data-access-layer/dal");
// Get all products: 
async function getAllVacationsAsync() {
    const sql = "SELECT * FROM vacationslist";
    const products = await dal.executeAsync(sql);
    return products;
}
async function getFollowedVacations(username) { // User followed vacations
    const vacations = [];
    const getUserIdSQL = `SELECT userId FROM users WHERE username = '${username}'`
    const userIdObject = await dal.executeAsync(getUserIdSQL);
    const userId = userIdObject[0].userId;
    const getFollowedVacationsIds = `SELECT vacationId FROM followedVacations WHERE userId = ${userId}`;
    const allVacationsIds = await dal.executeAsync(getFollowedVacationsIds);
    for (let i = 0; i < allVacationsIds.length; i++) {
        const vacationSQL = `SELECT * FROM vacationslist WHERE vacationId = ${allVacationsIds[i].vacationId}`;
        const vacation = await dal.executeAsync(vacationSQL);
        vacations.push(vacation[0]); // To add objects to array instead of adding arrays to array
    }
    return vacations;
}

async function getNumberOfFollowers() {
    const sql = "SELECT vacationslist.destination, COUNT(vacationslist.vacationId) AS numOfFollowers FROM `followedvacations` JOIN vacationslist ON vacationslist.vacationId = followedvacations.vacationId GROUP BY followedvacations.vacationId";
    const numOfFollowers = await dal.executeAsync(sql);
    return numOfFollowers;
}

async function updateVacation(vacationToUpdate) {
    // Adding strings of the properties to update
    let sql = "UPDATE vacationslist SET ";
    if (vacationToUpdate.description !== undefined) {
        vacationToUpdate.description = vacationToUpdate.description.split("'").join("''");
        sql += `description = '${vacationToUpdate.description}',`;
    }
    if (vacationToUpdate.destination !== undefined) {
        vacationToUpdate.destination = vacationToUpdate.destination.split("'").join("''");
        sql += `destination = '${vacationToUpdate.destination}',`;
    }
    if (vacationToUpdate.picturePath !== undefined) {
        sql += `picturePath = '${vacationToUpdate.picturePath}',`;
    }
    if (vacationToUpdate.flightDate !== undefined) {
        sql += `flightDate = '${vacationToUpdate.flightDate}',`;
    }
    if (vacationToUpdate.returnDate !== undefined) {
        sql += `returnDate = '${vacationToUpdate.returnDate}',`;
    }
    if (vacationToUpdate.price !== undefined) {
        sql += `price = ${vacationToUpdate.price},`;
    }
    sql = sql.substr(0, sql.length - 1); // Remove last comma.
    sql += ` WHERE vacationId = ${vacationToUpdate.vacationId}`;
    const info = await dal.executeAsync(sql);
    return info.affectedRows === 0 ? null : vacationToUpdate;
};
async function deleteVacation(id) {
    const sql = `DELETE FROM vacationslist WHERE vacationId = ${id}`;
    await dal.executeAsync(sql);

};

async function addFollower(vacationUserInfo) {
    const getUserIdSQL = `SELECT userId FROM users WHERE username = '${vacationUserInfo.username}'`
    const userIdObject = await dal.executeAsync(getUserIdSQL);
    const userId = userIdObject[0].userId;
    const sql = `INSERT INTO followedvacations(vacationId,userId) VALUES(${vacationUserInfo.vacationId},${userId})`;
    const addedFollower = await dal.executeAsync(sql);
    return addedFollower;
}
async function removeFollow(vacationId, username) {
    const getUserIdSQL = `SELECT userId FROM users WHERE username = '${username}'`
    const userIdObject = await dal.executeAsync(getUserIdSQL);
    const userId = userIdObject[0].userId;
    const sql = `DELETE FROM followedvacations WHERE userId = ${userId} AND vacationId = ${vacationId}`;
    const removedFollow = await dal.executeAsync(sql);
    return removedFollow;
}
async function addVacation(vacationToAdd) {
    // Ignore quotes.
    vacationToAdd.description = vacationToAdd.description.split("'").join("''");
    vacationToAdd.destination = vacationToAdd.destination.split("'").join("''");
    const sql = `INSERT INTO vacationslist(description,destination,picturePath,flightDate,returnDate,price) VALUES('${vacationToAdd.description}','${vacationToAdd.destination}','${vacationToAdd.picturePath}','${vacationToAdd.flightDate}','${vacationToAdd.returnDate}',${vacationToAdd.price})`;
    const info = await dal.executeAsync(sql);
    vacationToAdd.vacationId = info.insertId;
    return vacationToAdd;
}




module.exports = {
    getAllVacationsAsync,
    getFollowedVacations,
    getNumberOfFollowers,
    updateVacation,
    deleteVacation,
    addFollower,
    removeFollow,
    addVacation
};