var models = require('../models/models.js');

//Comprueba si el usuario está registrado en users
//Si autenticación falla o hay errores se ejecuta callback(error).
exports.autenticar = function(login, password, callback) {
	models.User.find({where: {"username": login}}).then(
		function (pUsuario) {
			if (password === pUsuario.password){
				callback(null, pUsuario);
			} else {
				callback(new Error("Password erróneo."));
			}
		}
	).catch(
		function (error) {
			callback(new Error("No existe el usuario."));
		}
	);
};
