'use strict'

const validator = require('validator'); //Paquete para validar datos que ingresan a través de lo pedidosconst Article = require('../models/article');
const Article = require('../models/article'); // Modelo articulo Mongoose
const fs = require('fs');   // File System nos permite eliminar archivos del sistema
const path = require('path'); // Modulo de path JS para sacar el path de un archivo 

const controller = {

	datosCurso: (req, res) => {
		return res.status(200).send({
			curso: 'Master Frameworks JS',
			autor: 'Victor Robles',
			alumno: 'German O. Macchia'
		});
	},

	test: (req, res) => {
		return res.status(200).send({
			message: ' Soy la accion test de mi controlador de articulos'
		});
	},

	save: (req, res) => {
			//recoger parametros por post
			const params = req.body;

			try{
			//validar datos
				var validate_title = !validator.isEmpty(params.title);
				var validate_content = !validator.isEmpty(params.content);

				if(validate_title && validate_content){

					//Crear objeto para guardar
					const article = new Article();

					//Asignar valores
					article.title = params.title;
					article.content = params.content;
					article.image = null;

					//guardar articulo
					article.save( (err, articleStored) => { 

						if(err || !articleStored){
							return res.status(404).send({
								status: 'erros',
								message: 'El articulo no se ha guardado'
							});
						}

					//devolver respuesta
						return res.status(200).send({ 
							status: 'success',
							article: articleStored
						});
					});
				}
			}catch( err ){
				return res.status(200).send({ 
					message: 'Faltan datos por enviar'
				});
			}
	},

	getArticles: (req, res) => {

		const query = Article.find({});
		const last = req.params.last;

		if(last || last != undefined){
			query.limit(5);
		}

		//Find, sort de forma descendente y exceptions
		query.sort('-_id').exec( (err, articles) =>{

			if(err){
				return res.status(500).send({ 
					status: 'error',
					message: 'Error al devolver articulos'
				});
			}

			if(!articles){
				return res.status(200).send({ 
					status: 'error',
					message: 'No hay articulos para mostrar'
				});
			}

			return res.status(200).send({ 
				status: 'success',
				articles
			});
		})
	},

	getArticle: (req, res) => {

		// Recoger el id de la URL
		var articleId = req.params.id;
		
		// Comprobar que existe

		if(!articleId || articleId == null ){
				return res.status(404).send({ 
					status: 'error',
					message: 'Error, no existe el articulo'
				});
		}

		// Buscar el articulo
		Article.findById(articleId, (err, article) => {


			if(err || !article){
				return res.status(404).send({ 
					status: 'error',
					message: 'Error, no existe el articulo'
				});				
			}

					// Devolverlo en Json
			return res.status(200).send({ 
				status: 'success',
				article
			});			
		});
	},

	update: (req, res) => {

		// Recoger el id del articulo por la url
		var articleId = req.params.id;

		// Recoger los datos que llegan por put
		var params = req.body;

		// Validar datos
		try{
			//cuando los parametros efectivamente NO estan vacios dara true
			var validate_title = !validator.isEmpty(params.title); 
			var validate_content = !validator.isEmpty(params.content); 

		}catch(err){
			return res.status(404).send({ 
				status: 'error',
				message: 'Faltan datos por enviar'
				});		
		};

		if(validate_title && validate_content){
			// Find and Update
			Article.findOneAndUpdate(
				{_id: articleId},  // articulo que quiero actualizar
				params,			   // params para actualizar el articulo en sí
				{new: true},	   // Este opción reclama que la devolución sea el objeto actualizado
				//callback para manejar error del metodo update
				(err, articleUpdated) => {    
					if(err){
						return res.status(500).send({  //internal Server Error
							status: 'error',
							message: 'Error al actualizar'
						})
					};

					if(!articleUpdated){
						return res.status(404).send({  //No encontrado
							status: 'error',
							message: 'No existe el articulo'
						});						
					}

					return res.status(200).send({ 
						status: 'success',
						article: articleUpdated					
					});
				}
			);
		}else{
			// Devolver Respuesta
			return res.status(500).send({ 
				status: 'error',
				message: 'La validación no es correcta'
			});	
		}
	},

	delete: (req, res) => {
		// Recoger el id de la url

		var articleId = req.params.id;

		// Find and Delete
		Article.findOneAndDelete(
		{_id: articleId},
		(err, articleRemoved) =>{

			if(err){
				return res.status(500).send({ 
					status: 'error',
					message: 'Error al borrar'
				});	
			}
			if(!articleRemoved){
				return res.status(404).send({ 
					status: 'error',
					message: 'No se ha borrado el articulo, posiblemente no exista'
				});	
			}

			return res.status(200).send({ 
				status: 'success',
				article: articleRemoved					
			});

		});
	},

	upload: (req, res) => {
		//Configurar modulo de connect multiparty router/article.js
		// Recoger el fichero de la petición
		var file_name = 'Imagen no subida...';

		if(!req.files){
			return res.status(404).send({ 
				status: 'error',
				message: file_name
			});				
		}

		// Conseguir nombre y la extensión del archivo
		var file_path = req.files.file0.path; //se lo pone porque los frameworks suelen poner este nombre
		var file_split = file_path.split('\\'); //Solo porque pruebo en Windows, si es Linux (servidor) usa otra /

		// Extension del fichero (para que sea solo imagen lo que puedan subir)
		var file_name = file_split[2];
		var extension_split = file_name.split('\.') 
		var file_ext = extension_split[1];

		//Comprobar la extension, solo imagenes, si no es valida borrar el fichero

		if(
			file_ext != 'png' &&
			file_ext != 'jpg' &&
			file_ext != 'jpeg' &&
			file_ext != 'gif' 
			){

			fs.unlink(file_path, (err) => {
				return res.status(200).send({ 
					status: 'Error',
					message: 'La extension del archivo no es valida'		
				});
			});
		}else{

			var articleId = req.params.id;
			//buscar articulo, asignarle el nombre de la imagen y actualizarlo
			Article.findOneAndUpdate(
				{_id: articleId}, 
				{image: file_name},
				{new: true},
				(err, articleUpdated) => {

					if( err || !articleUpdated){
						return res.status(500).send({ 
							status: 'Error',
							message: 'Error al guardar la imagen del articulo'		
						});
					}

					return res.status(200).send({ 
						status: 'success',
						fichero: articleUpdated		
					});
			});
		}
	},

	getImage: (req, res) => {

		// Sacar el fichero que nos llega por la url
		const file = req.params.image;

		// Sacar path completo
		const path_file = './upload/articles/' + file;

		// Comprobar que el fichero exista
		fs.exists(path_file, (exists) => {
			if(exists){
				//devuelve el fichero a través de la libreria path para utilizarlo en etiqueta de imagen
				return res.sendFile(path.resolve(path_file));
			}else{
				return res.status(404).send({ 
					status: 'Error',
					message: 'Esta la imagen no existe'		
				});
			}
		});
	},

	search: (req, res) => {
		// Sacar el String a buscar
		const searchString = req.params.search;

		// find or ...Las condiciones no van a ser fijas $or mongoose
		Article.find({"$or": [
				{"title":{"$regex": searchString, "$options": "i"} }, //cuando el titulo contenga searchString -> saca los articulos
				{"content":{"$regex": searchString, "$options": "i"} }
			]
		})
		.sort([['date', 'descending']])
		.exec((err, articles) => {
			if(err){
				return res.status(500).send({ 
					status: 'Error',
					message: 'Error en la petición'		
				});
			}
			if(!articles || articles.length <= 0){
				return res.status(404).send({ 
					status: 'Error',
					message: 'No hay articulos que coincidan'		
				});
			}

			return res.status(200).send({ 
				status: 'success',
				articles		
			});
		})
	}

};

module.exports = controller;
