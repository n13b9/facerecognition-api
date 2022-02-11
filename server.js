const express = require("express");
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt-nodejs")
const cors =require("cors")
const knex = require("knex")


const db=knex({
  client: 'mysql',
  connection: {
    host : '127.0.0.1',
    port : 5432,
    user : 'neeraj',
    password : '',
    database : 'smart-brain'
  }
});

db.select("*").from("users").then(data=>{
	console.log(data);
});

const app = express();
app.use(bodyParser.json());
app.use(cors())



// app.get("/",(req,res)=>{
// 	res.send("this is working")
// })


app.post("/signin",(req,res)=>{

		db.select("email","hash").from("login")
			.where("email","=",req.body.email)
			.then(data=>{
			const isValid=	bcrypt.compareSync(req.body.password,data[0].hash);
			if(isValid){
			return	db.select("*").from("users")
				.where("email","=",req.body.email)
				.then(user=>{
					res.json(user[0])
				})
				.catch(err=>res.json(400).status.json("unable user"))
				
			} else{
				res.status(400).json("wrong cred")
			}
			
			})
			.catch(err=>res.json(400).status.json("wrong cred"))


			// bcrypt.compare("apple", "$2a$10$itq8PIlY2mupb15fwXMEAO30.u7IxMG8KsJUlOM3Fng3Ye2Xvnoaa", function(err, res) {
   //  				// res == true
			// });
			// bcrypt.compare("veggies", "$2a$10$itq8PIlY2mupb15fwXMEAO30.u7IxMG8KsJUlOM3Fng3Ye2Xvnoaa", function(err, res) {
			//     // res = false
			// });
})

app.post("/register",(req,res)=>{
		const {email, name, password} = req.body;
		const hash=bcrypt.hashSync(password);
		db.transaction(trx=>{
			trx.insert({
				hash:email,
				hash:hash,
				email:email
			})
			.into("login")
			.returning("email")
			.then(loginEmail=>{
				return trx("users")
				 	.returning("*")
				 	.insert({
				 		email:loginEmail[0],
				 		name:name,
				 		joined: new Date()
	 	})
	 		.then(user=>{
	 			res.json(user[0])
	 		})
			})
		})
		.then(trx.commit)
		.then(trx.rollback)

			// bcrypt.hash(password, null, null, function(err, hash) {
   //  				// Store hash in your password DB.
   //  				console.log(hash);
			// })
	 		.catch(err=>res.status(404).json("unable to register"))
	 	
})


app.get("/profile/:id", (req,res)=>{
		const {id} = req.params;
		let found = false;
		db.select("*").from("users")
		.where({
			id:id
		})
		.then(user=>{
			if(user.length){
				res.json(user[0])
			}else {
				res.status(404).json("uff. not found")
			}
			
		})
		// if(!found){
		// 	res.status(404).json("not found");
		// }
})

app.put("/image",(req,res)=>{
		const {id} = req.body;

		db("users").where('id', '=', id)
		  .increment("entries",1)
		  .returning("entries")
		  .then(entries=>{
			res.json(entries[0])
		  })
		  .catch(err=>res.status(400).json("unable to"))
  })
		

// // Load hash from your password DB.


app.listen(3000, ()=>{
	console.log("app is running on port 3000")
});