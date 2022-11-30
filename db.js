const {Sequelize} = require('sequelize')

module.exports = new Sequelize(
    'root',
    'root',
    'root',
    {
        host: 'postgres',
        port: '5432',
        dialect: 'postgres'
    }
)