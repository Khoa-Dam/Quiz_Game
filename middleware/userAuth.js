import jwt from "jsonwebtoken";

const userAuth = async (req,res,next) => {
    const token = req.cookies.token;
    if(!token) {
        return res.json({success: false, message: "Not Authorized. Login Again"});
    }
    
    try {
        const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET);

       if(tokenDecoded) {
        req.body.userId = tokenDecoded.id
       } else {
        return res.json({success: false, message: "Not Authorized. Login Again"});
       }

        next();

    } catch (error) {
        console.log("check", error);
        return res.json({success: false, message: error.message})
    }
}

export default userAuth;