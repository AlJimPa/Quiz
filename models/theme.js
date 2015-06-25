//Definición del modelo de Theme

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('Theme', 
	{ //Sección: definición de tabla
		texto: {
			type: DataTypes.STRING,
			validate: {notEmpty: {msg: "-> Falta tema"}}
		}, 
		descripcion: {
			type: DataTypes.STRING
		}
	});
}
