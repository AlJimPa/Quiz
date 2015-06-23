var models = require('../models/models.js');

exports.show = function(req, res) {
	var estadisticas = {};
	//El número de preguntas
	models.Quiz.count().then(
		function(recuento) {
			estadisticas.countPreguntas = {};
			estadisticas.countPreguntas.nombre = "Número de preguntas";
			estadisticas.countPreguntas.valor = recuento;
			//El número de comentarios totales
			return models.Comment.count();
		}
	).then(
		function(recuento) {
			estadisticas.countComentarios = {};
			estadisticas.countComentarios.nombre = "Número de comentarios totales";
			estadisticas.countComentarios.valor = recuento;
			//El número medio de comentarios por pregunta
			estadisticas.promedioComentariosPorPregunta = {};
			estadisticas.promedioComentariosPorPregunta.nombre 
					= "Promedio comentarios por pregunta";
			estadisticas.promedioComentariosPorPregunta.valor 
					= (estadisticas.countComentarios.valor / estadisticas.countPreguntas.valor) || 0;
			//El número de preguntas con comentarios
			return models.Comment.aggregate("quizId", "count", {distinct: true});
		}
	).then(
		function(recuento) {
			estadisticas.countPreguntasConComentario = {};
			estadisticas.countPreguntasConComentario.nombre 
					= "Número de preguntas con comentarios"
			estadisticas.countPreguntasConComentario.valor = recuento;
			//El número de preguntas sin comentarios
			estadisticas.countPreguntasSinComentario = {};
			estadisticas.countPreguntasSinComentario.nombre 
					= "Número de preguntas sin comentarios";
			estadisticas.countPreguntasSinComentario.valor
					= estadisticas.countPreguntas.valor - recuento;
			res.render('quizes/statistics.ejs', {estadisticas: estadisticas, errors: []});
		}
    ).catch(function(error){
		console.log(error);
		next(error);
	});

};
