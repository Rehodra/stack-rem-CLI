import jwt from 'jsonwebtoken'

const generateToken = (user, res) =>{
    const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET,{expiresIn: '5d'})
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    })
}

export default generateToken;