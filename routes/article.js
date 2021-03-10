'use strict'

const express = require('express');
const router = express.Router();
const multipart = require('connect-multiparty')

const ArticleController = require('../controllers/article');
const md_upload = multipart({ uploadDir: './upload/articles' });

//rutas de prueba
router.get('/test-de-controllador', ArticleController.test);
router.post('/datos-curso', ArticleController.datosCurso);

//rutas útiles
router.post('/save', ArticleController.save);
router.get('/articles', ArticleController.getArticles);
router.get('/articles/:last?', ArticleController.getArticles);
router.get('/article/:id', ArticleController.getArticle);
router.put('/article/:id', ArticleController.update);
router.delete('/article/:id', ArticleController.delete);
router.post('/upload-image/:id', md_upload, ArticleController.upload);
router.get('/get-image/:image', ArticleController.getImage);
router.get('/search/:search', ArticleController.search);


module.exports = router;