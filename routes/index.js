var express = require('express');
var router = express.Router();

var quizController = require('../controllers/quiz_controller');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Quiz' });
});

//páginas de quiz - pregunta y respuesta
router.get('/quizes/question', quizController.question);
router.get('/quizes/answer', quizController.answer);

//página de créditos
router.get('/author', function(req, res) {
	res.render('author');
});

module.exports = router;
