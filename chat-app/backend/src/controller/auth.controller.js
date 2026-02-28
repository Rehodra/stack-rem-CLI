import User from '../models/user.models.js'; 
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }
    const existingUser = await User.findOne({email: email});
    const isMatched = await bcrypt.compare(password, existingUser?.password || "");

    if(!isMatched){
        return res.status(400).json({ message: "Invalid email or password" });
    }
    generateToken(existingUser, res); // sets the cookies here

    res.status(200).json({
        _id: existingUser._id,
        fullName: existingUser.fullName,
        userName: existingUser.userName,
        email: existingUser.email
     });
  } catch (error) {
    res.status(500).json({ message: "Internal server error at login controller:" + error });
  }
};

export const signup = async (req, res) => {
  try {
    const { fullName, userName, email, password, gender } = req.body;
    
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    // Password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

  const boyProfilePictures = "https://avatar.iran.liara.run/public/boy";
  const girlProfilePictures = "https://avatar.iran.liara.run/public/girl";

   const newUser = await User.create({
      fullName,
      userName,
      email,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      gender,
      profilePicture: gender === "male"   ? boyProfilePictures : girlProfilePictures
    });
    generateToken(newUser, res); // sets the cookies here

    res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        userName: newUser.userName,
        email: newUser.email
     });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error signup controller,  error:" + error });
  }
};


export const logout = (req, res) => {
  try {
    res.cookie("token", "", {
        httpOnly: true,
        maxage: 0,
        sameSite: "strict",
    });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Error logging out user:", error);
    res.status(500).json({ message: "Internal server error logout controller,  error:" + error });
  }
};