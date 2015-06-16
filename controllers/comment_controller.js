var models = require('../models/models.js');

//GET /quizes/:quizId/comments/new
exports.new = function(req, res) {	
	res.render('comments/new', {quizId: req.params.quizId, errors: []});
};

//POST /quizes/:quizId/comments
exports.create = function(req, res) {
	var comment = models.Comment.build({
			texto: req.body.comment.texto, 
			QuizId: req.params.quizId
	});
	comment.validate().then(
		function(err) {
			if (err) {
				res.render('comments/new.ejs', {comment: comment, quizid: comment.QuizId, errors: err.errors});
			} else {
				// guarda en DB el comentario
				comment.save().then(
					function(){
						res.redirect('/quizes/' + comment.QuizId);
					}  //Redirección HTTP (URL relativo) a la pregunta
				);
			}
		}
	);
}