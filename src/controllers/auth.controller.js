import bcrypt from "bcrypt";
import User from "../models/User.js";

// ĐĂNG KÝ
export const register = async (req, res) => {
  const { username, password } = req.body;

  const exist = await User.findOne({ username });
  if (exist) {
    return res.status(400).json({ message: "Username đã tồn tại" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });
  await user.save();

  res.json({ message: "Đăng ký thành công" });
};

// ĐĂNG NHẬP
export const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ message: "Sai tài khoản" });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).json({ message: "Sai mật khẩu" });
  }

  res.json({ message: "Đăng nhập thành công", username });
};