//Definición de modelo User
module.exports = function(sequelize, DataTypes){
	return sequelize.define('User', 
	{
		username: {
			type: DataTypes.STRING,
			validate: {notEmpty: {msg: " No se ha informado el usuario"}}
		},
		password: {
			type: DataTypes.STRING,
			validate: {notEmpty: {msg: " No se ha informado la password"}}			
		}
		
	});
}