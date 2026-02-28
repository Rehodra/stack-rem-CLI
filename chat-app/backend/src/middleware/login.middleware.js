import jwt from 'jsonwebtoken';

export const isLoggedIn = (req, res, next) => {
    
    try {
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    // verify if token is found:
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);

        if(!decodedData){
            return res.status(401).json({ message: "Unauthorized: Invalid token in isLoggedIn middleware" });
        }

        const userId = decodedData.id;
        req.userId = userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: Invalid token in isLoggedIn middleware" });
    }
}