var models = require('../models/models.js');

// Autoload - factoriza el código si ruta incluye quizId
exports.load = function(req, res, next, quizId){
	models.Quiz.find(quizId).then(
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
	var strQuery = "%";
	if (req.query.search !== undefined) {
		strQuery = strQuery + req.query.search.replace(' ', '%') + "%";
	}
	models.Quiz.findAll({where: ["pregunta like ? order by pregunta", strQuery]}).then(
		function(quizes){
			res.render('quizes/index.ejs', {quizes: quizes, errors: []});
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
	var quiz = models.Quiz.build( //crea objeto quiz
		{pregunta: "Pregunta", respuesta: "Respuesta"}
	);
	res.render('quizes/new', {quiz: quiz, errors: []});
}

//GET /quizes/edit
exports.edit = function(req, res) {
	var quiz = req.quiz; //autoload de quiz
	res.render('quizes/edit', {quiz: quiz, errors: []});
}

//POST /quizes/create
exports.create = function(req, res) {
	var quiz = models.Quiz.build(req.body.quiz);
	quiz.validate().then(
		function(err) {
			if (err) {
				res.render('quizes/new', {quiz: quiz, errors: err.errors});
			} else {
				// guarda en DB los campos pregunta y respuesta de quiz	
				quiz.save({fields: ["pregunta", "respuesta"]}).then(
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
	req.quiz.validate().then(
		function(err) {
			if (err) {
				res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
			} else {
				// guarda en DB los campos pregunta y respuesta de quiz	
				req.quiz.save({fields: ["pregunta", "respuesta"]}).then(
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
