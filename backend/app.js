import express from "express";
import cors from "cors";
import { httpLogger, logger } from "./configs/logger.js";
import routes from "./routes/index.js";

const app = express();

app.use(httpLogger);
app.use(cors());
app.use(express.json());
// --- THÊM ĐOẠN NÀY VÀO ---
app.get("/health", (req, res) => {
   // Phản hồi 200 OK ngay lập tức để báo hiệu server ổn
   res.status(200).send("OK");
});
// ------------------------
app.use("/api", routes);

// log the error
app.use((err, req, res, next) => {
   logger.error(
      { err, req: { url: req.url, method: req.method } },
      "Unhandled error"
   );
   res.status(err.status || 500).json({
      error: err.message || "Internal Server Error",
   });
});

export default app;
