import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Fake register API (không SQL)
app.post("/auth/register", (req, res) => {
  const { username, fullName, email } = req.body;
  console.log("User đăng ký:", username);
  return res.json({ message: "Đăng ký thành công (KHÔNG DB)!" });
});

// Fake login API (không SQL)
app.post("/auth/login", (req, res) => {
  const { username } = req.body;
  return res.json({
    token: "fake-token",
    user: { name: username, avatar: "/user.png", email: username },
  });
});

app.listen(5000, () =>
  
  console.log("Backend FAKER chạy tại http://localhost:5000 (no SQL)")
);
