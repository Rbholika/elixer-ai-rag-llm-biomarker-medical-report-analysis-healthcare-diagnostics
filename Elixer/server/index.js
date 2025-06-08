require("dotenv").config();
const express = require("express");
const session = require("express-session") 
const app = express();
const cors = require("cors");
const connection = require("./db");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const fileRoutes = require("./routes/files");
const conversationRoutes = require("./routes/conversations");
const bloodReportRoutes = require("./routes/bloodReports");
// const urineTestRoutes = require("./routes/urineTests");
// const papSmearRoutes = require("./routes/papSmears");
// const spermAnalysisRoutes = require("./routes/spermAnalysis");
// const stoolTestRoutes = require("./routes/stoolTest");
// const swabTestRoutes = require("./routes/swabTest");

const MongoDBStore = require('connect-mongodb-session')(session);

// database connection
connection();

// middlewares
app.use(express.json());
app.use(cors());

// session config
const store = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: 'sessions'
});

app.use(session({
    secret: process.env.JWTPRIVATEKEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 24 hours (adjust as needed)
        expires: new Date(Date.now() + (24 * 60 * 60 * 1000)) // Same as maxAge
    },
    store: store
}));

// routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/bloodreport", bloodReportRoutes);
// app.use("/api/urineTests", urineTestRoutes);
// app.use("/api/papSmears", papSmearRoutes);
// app.use("/api/spermAnalysis", spermAnalysisRoutes);
// app.use("/api/stoolTest", stoolTestRoutes);
// app.use("/api/swabTest", swabTestRoutes);

const port = process.env.PORT || 8080;
app.listen(port, console.log(`Listening on port ${port}...`));
