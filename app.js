const express = require('express');
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const mongoose = require('mongoose');
const Location = require("./models/Location"); // Import the Location model

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/real_time_tracking', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));

io.on("connection", function (socket) {
    console.log("New connection:", socket.id);

    socket.on("send-location", async function (data) { // Use async/await
        console.log("Location received from client:", data);

        // Create a new Location document and save it to MongoDB
        const location = new Location({
            userId: socket.id,
            latitude: data.latitude,
            longitude: data.longitude
        });

        try {
            await location.save(); // Save the location to MongoDB
            console.log("Location saved to MongoDB:", location);
        } catch (error) {
            console.error("Error saving location:", error);
        }

        io.emit("receive-location", { id: socket.id, ...data });
    });

    socket.on("disconnect", function () {
        console.log("User disconnected:", socket.id);
        io.emit("user-disconnected", socket.id);
    });
});

app.get("/", function (req, res) {
    res.render("index");
});

server.listen(3002, () => {
    console.log("Server running on port 3002");
});
