'use strict'

const mongoose = require('mongoose');
const app = require('./app');
const port = 3900;

// Conexion a Mongoose
mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/api_rest', { useNewUrlParser: true })
		.then( ()=> {
			console.log('-------------------------------------------------------')
			console.log('<<<<< Conexión a la base de datos MongoDB exitosa >>>>>');

			// Crear servidor y escuchar peticiones

			app.listen( port, () => {
				console.log(`<<<<<      Servidor corriendo en puerto ${port}      >>>>>`);
			})
		});

