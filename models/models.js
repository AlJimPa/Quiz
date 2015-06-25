var path = require('path');

// Postgres DATABASE_URL = postgres://user:passwd@host:port/database
// SQLite	DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name  = (url[6]||null);
var user	 = (url[2]||null);
var pwd	 	 = (url[3]||null);
var protocol = (url[1]||null);
var dialect	 = (url[1]||null);
var port	 = (url[5]||null);
var host	 = (url[4]||null);
var storage = process.env.DATABASE_STORAGE;

// Cargar Modelo ORM
var Sequelize = require('sequelize');

// Usar BBDD SQLite o Postgres
var sequelize = new Sequelize(DB_name, user, pwd,
	{dialect:  protocol, 
	 protocol: protocol,
	 port:	   port,
	 host:     host,
	 storage:  storage, // solo SQLite (.env)
	 omitNull: true		// solo Postgres
   }
);

// Importar la definición de la tabla Quiz en quiz.js
var quiz_path = path.join(__dirname, 'quiz');
var Quiz = sequelize.import(quiz_path);
// Importar la definición de la tabla Comment en comment.js
var comment_path = path.join(__dirname, 'comment');
var Comment = sequelize.import(comment_path);
 //relaciones de comment: Quiz 1-N Comment
Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);
// Importar la definición de la tabla Theme en theme.js
var theme_path = path.join(__dirname, 'theme');
var Theme = sequelize.import(theme_path);
 //relaciones de comment: Quiz N-1 Theme (quiz tendrá la FK a theme)
Quiz.belongsTo(Theme, {foreignKey: {allowNull: false}, onDelete: "CASCADE"});
Theme.hasMany(Quiz);
// Importar la definición de la tabla User en user.js
var user_path = path.join(__dirname, 'user');
var User = sequelize.import(user_path);

// /EXPORTACIONES
exports.Quiz = Quiz; //exportar definición de tabla Quiz
exports.Comment = Comment;//exportar definición de tabla Comment
exports.Theme = Theme;//exportar definición de tabla Theme
exports.User = User;//exportar definición de tabla Theme

// /INSERCIONES EN LAS TABLAS
var _temas = null;
var _quizesCreados = 0;
// sequelize.sync() crea e inicializa tabla de preguntas en DB
sequelize.sync().then(function() {
	//success(...) ejecuta el manejador una vez creada la tabla
	User.count().then(
		//Inserciones iniciales en User
		function (count){
			if (count === 0){
				User.create({
					username: "admin",
					password: "1234"
				});
				User.create({
					username: "pepe",
					password: "5678"
				});
			}
			return Theme.count();
		}
	).then(
		//Inserciones iniciales en Theme
		function (count){
			if (count === 0){
				Theme.create({
					texto: "Otro",
					descripcion: "No encaja con ninguno de los temas definidos"
				});
				Theme.create({
					texto: "Humanidades", 
					descripcion: "Literatura clásica, historia y filosofia entre otros"
				});
				Theme.create({
					texto: "Ocio",
					descripcion: "Literatura moderna, cine, música y otras artes"
				});
				Theme.create({
					texto: "Ciencia",
					descripcion: "Matemáticas, física, química, biología, etc."
				});
				Theme.create({
					texto: "Tecnología", 
					descripcion: "Herramientas, técnicas y procedimientos industriales"
				});
			}
			return Quiz.count(); //callback para el siguiente then
		}
	).then(
		//Inserciones en Quiz.
		function (count){
			if(count == 0) {	// la tabla se inicializa solo si está vacía
				//crear array de quizzes para crear los objetos quiz mediante función
				var arrayQuizzes = [];
				var objetoQuiz;
				objetoQuiz = {
					pregunta: 'Capital de Italia', 
					respuesta: 'Roma',
					tema: 'Otro'
				};
				arrayQuizzes.push(objetoQuiz);
				objetoQuiz = {
					pregunta: 'Capital de Portugal', 
					respuesta: 'Lisboa', 
					tema: 'Otro'
				};
				arrayQuizzes.push(objetoQuiz);
				objetoQuiz = {
					pregunta: 'Creador del kernel Linux', 
					respuesta: 'Linus Torvalds',
					tema: 'Tecnología'
				};
				arrayQuizzes.push(objetoQuiz);
				for (var i in arrayQuizzes) {
					crearQuiz(arrayQuizzes[i], arrayQuizzes.length);
				}				
			};
		}
	);
});

function crearQuiz(oQuiz, numeroQuizesACrear){
	Theme.find({where: {texto: oQuiz.tema}}).then(
		function(tuplaTema){
			Quiz.create({ 
				pregunta: oQuiz.pregunta, 
				respuesta: oQuiz.respuesta,
				tema: oQuiz.tema,
				ThemeId: tuplaTema.id
			}).then(
				function(){
					_quizesCreados++;
					if (_quizesCreados == numeroQuizesACrear){
						console.log('Base de datos inicializada')
					}
				}
			);
		}
	);
}