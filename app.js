const express = require("express")
const dotenv = require("dotenv")
const connectDatabase = require("./database/connection")
const userRoutes = require("./routes/userRoutes")
const postRoutes = require("./routes/postRoutes")

dotenv.config()

const app = express()

app.use(express.json())

const port = process.env.PORT || 5000

app.use("/api/auth", userRoutes)
app.use("/api/blogs", postRoutes)

connectDatabase().then(() => {
  app.listen(port, function () {
    console.log("Server is running on port " + port)
  })
})
