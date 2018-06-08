const mysql = require('mysql');

module.exports = class Database
{
    constructor(config) {
        this.connection = mysql.createConnection(config);
    }

    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (error, results) => {
                if (error) return reject(error);

                resolve(results);
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(error => {
                if (error) return reject(error);

                resolve();
            });
        });
    }
};