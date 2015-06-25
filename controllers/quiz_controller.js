var models = require('../models/models.js');

// Autoload - factoriza el código si ruta incluye quizId
exports.load = function(req, res, next, quizId){
	models.Quiz.find({
			where: { id : Number(quizId) }, 
			include: [{model: models.Comment}]
		}).then(
		function (quiz){
			if (quiz){
				req.quiz = quiz;
				next();
			} else {
				next(new Error("No existe quizId " + quizId));
			}
		}
	).catch(
		function(error){
			next(error);
		}
	);
};

// GET /quizes
exports.index = function(req, res) {
	var query = {};
	if (req.query.search !== undefined) {
		var strQuery = "%" + req.query.search.replace(' ', '%') + "%";
		query.where = ["pregunta like ? order by pregunta", strQuery];
	}
	query.include = [{model: models.Theme, attributes: ["texto"]}];
	query.attributes = ["id", "pregunta"];
	models.Quiz.findAll(query).then(
		function(pQuizes){
			res.render('quizes/index.ejs', {quizes: pQuizes, errors: []});
		}
	);
};

// GET /quizes/show
exports.show = function(req, res) {
	res.render('quizes/show', {quiz: req.quiz, errors: []});
};

//GET /quizes/answer
exports.answer = function(req, res) {
	var resultado = "Incorrecto";
	if (req.query.respuesta === req.quiz.respuesta) {
		resultado = 'Correcto';
	}
	res.render('quizes/answer', {quiz: req.quiz, respuesta: resultado, errors: []});
};

//GET /quizes/new
exports.new = function(req, res) {
	models.Theme.findAll().then(
		function (temas){
			var quiz = models.Quiz.build({ //crea objeto quiz
				pregunta: "Pregunta", 
				respuesta: "Respuesta", 
				ThemeId: temas[0].id}
			);
			res.render('quizes/new', {quiz: quiz, temas: temas, errors: []});
		}
	);
}

//GET /quizes/edit
exports.edit = function(req, res) {
	models.Theme.findAll().then(
		function (temas){
			var quiz = req.quiz; //autoload de quiz
			res.render('quizes/edit', {quiz: quiz, temas: temas, errors: []});
		}
	);
}


//POST /quizes/create
exports.create = function(req, res) {
	console.log("Lista de temas obtenida!");
	var quiz = models.Quiz.build(req.body.quiz);
	quiz.validate().then(
		function(err) {
			if (err) {
				res.render('quizes/new', {quiz: quiz, errors: err.errors});
			} else {
				// guarda en DB los campos pregunta y respuesta de quiz	
				quiz.save({fields: ["pregunta", "respuesta", "ThemeId"]}).then(
					function(){
						res.redirect('/quizes');
					}  //Redirección HTTP (URL relativo) a lista de preguntas
				);
			}
		}
	);
}

//PUT /quizes/update - a diferencia de create, actualiza req.quiz (del autoload)
exports.update = function(req, res) {
	req.quiz.pregunta = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;
	req.quiz.ThemeId = req.body.quiz.ThemeId;
	req.quiz.validate().then(
		function(err) {
			if (err) {
				res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
			} else {
				// guarda en DB los campos pregunta y respuesta de quiz	
				req.quiz.save({fields: ["pregunta", "respuesta", "ThemeId"]}).then(
					function(){
						res.redirect('/quizes');
					} //Redirección HTTP (URL relativo) a lista de preguntas
				);
			}
		}
	);	
}

//DELETE /quizes/
exports.destroy = function(req, res) {
	req.quiz.destroy().then(
		function(){
			res.redirect('/quizes');
		} //Redirección HTTP (URL relativo) a lista de preguntas
	).catch(
		function(error){
			next(error);
		}
	);
}
